import { useEffect, useRef, useState } from 'react'
import { F, absF, negF } from '../ecuaciones/EcuacionEngine'
import { useLang } from '../../i18n/LanguageContext'

// Input manual de operación para los motores de despeje.
// Tipos soportados: add, sub, mul, div, addX, subX, addY, subY.
// Si el usuario ingresa un numerador negativo, lo flipeamos a la op opuesta
// con valor positivo (para no mostrar "+ −3").
const FLIP = {
  add: 'sub', sub: 'add',
  addX: 'subX', subX: 'addX',
  addY: 'subY', subY: 'addY',
}

function asFrac(x) { return typeof x === 'number' ? F(x) : x }

function normalize(op) {
  if (!op) return op
  const v = asFrac(op.value)
  // Siempre emitimos value como Frac para que el motor downstream no se rompa
  // si esperaba siempre un Frac (DespejeBiVar opera sobre Fracs).
  if (v.n >= 0) {
    return { ...op, value: absF(v) }
  }
  if (op.type in FLIP) {
    return { type: FLIP[op.type], value: negF(v) }
  }
  return { ...op, value: v }
}

// Props:
//   opTypes: [{ type, label }]
//   onApply(op): callback al apretar Aplicar (op normalizada)
//   onPreviewChange(op|null): callback continuo con el preview actual
//   disabled: bool
export default function ManualOpInput({ opTypes, onApply, onPreviewChange, disabled }) {
  const { t } = useLang()
  const [opType, setOpType] = useState(null)
  const [numStr, setNumStr] = useState('')
  const [denStr, setDenStr] = useState('')
  const [fracMode, setFracMode] = useState(false)
  const numRef = useRef(null)
  const denRef = useRef(null)

  const parsedNum = parseInt(numStr, 10)
  const parsedDen = !fracMode || denStr === '' ? 1 : parseInt(denStr, 10)
  const previewValid =
    opType &&
    Number.isFinite(parsedNum) && parsedNum !== 0 &&
    Number.isFinite(parsedDen) && parsedDen >= 1
  const previewOp = previewValid
    ? normalize({
        type: opType,
        value: parsedDen === 1 ? parsedNum : F(parsedNum, parsedDen),
      })
    : null

  useEffect(() => {
    if (onPreviewChange) onPreviewChange(previewOp)
    // eslint-disable-next-line
  }, [opType, numStr, denStr, fracMode])

  function clearInput() {
    setOpType(null); setNumStr(''); setDenStr(''); setFracMode(false)
    if (onPreviewChange) onPreviewChange(null)
  }

  function handleApply() {
    if (!previewOp || disabled) return
    onApply(previewOp)
    clearInput()
  }

  function pickOp(type) {
    setOpType(type)
    // Auto-foco al numerador apenas elige el operador.
    setTimeout(() => numRef.current?.focus(), 0)
  }

  function toggleFrac() {
    setFracMode((m) => {
      const next = !m
      if (!next) setDenStr('')
      else setTimeout(() => denRef.current?.focus(), 0)
      return next
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center gap-3 w-full">
      <div className="text-sm text-gray-500 font-medium">
        {t.ecuaciones.enterOperation}
      </div>
      <div className="flex flex-wrap justify-center items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2">
          {opTypes.map((o) => (
            <button
              key={o.type}
              disabled={disabled}
              onClick={() => pickOp(o.type)}
              className={`px-4 py-2 rounded-xl font-mono font-bold text-2xl border-2 transition-all
                ${
                  opType === o.type
                    ? 'bg-indigo-500 text-white border-indigo-600 scale-105 shadow-lg'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {o.label}
            </button>
          ))}
        </div>
        <NumberFracInput
          numStr={numStr} denStr={denStr}
          onNumChange={setNumStr} onDenChange={setDenStr}
          disabled={disabled}
          fracMode={fracMode}
          onToggleFrac={toggleFrac}
          onSubmit={handleApply}
          numRef={numRef}
          denRef={denRef}
        />
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={clearInput}
          disabled={disabled || (!opType && !numStr && !denStr)}
          className="px-5 py-2 rounded-xl font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t.ecuaciones.changeOp}
        </button>
        <button
          onClick={handleApply}
          disabled={disabled || !previewValid}
          className="px-6 py-2 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition-all hover:scale-105"
        >
          {t.ecuaciones.apply} →
        </button>
      </div>
    </div>
  )
}

function NumberFracInput({ numStr, denStr, onNumChange, onDenChange, disabled, fracMode, onToggleFrac, onSubmit, numRef, denRef }) {
  const { t } = useLang()
  const cleanNum = (s) => s.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
  const cleanDen = (s) => s.replace(/[^0-9]/g, '')
  function onKeyDownAny(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSubmit && onSubmit()
    }
  }
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col items-center w-24 px-2 py-1 rounded-xl border-2 ${
          fracMode ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-white'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <input
          ref={numRef}
          type="text"
          inputMode="numeric"
          value={numStr}
          disabled={disabled}
          onChange={(e) => onNumChange(cleanNum(e.target.value))}
          onKeyDown={onKeyDownAny}
          placeholder={t.ecuaciones.numPlaceholder}
          aria-label={t.ecuaciones.numerator}
          className="w-full font-mono font-bold text-2xl bg-transparent focus:outline-none text-center"
        />
        {fracMode && (
          <>
            <div className="w-full border-t-2 border-current my-1" />
            <input
              ref={denRef}
              type="text"
              inputMode="numeric"
              value={denStr}
              disabled={disabled}
              onChange={(e) => onDenChange(cleanDen(e.target.value))}
              onKeyDown={onKeyDownAny}
              placeholder={t.ecuaciones.denPlaceholder}
              aria-label={t.ecuaciones.denominator}
              className="w-full font-mono font-bold text-xl bg-transparent focus:outline-none text-center text-gray-600"
            />
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleFrac}
        disabled={disabled}
        className={`mt-1 text-[11px] px-2 py-0.5 rounded-md border font-medium transition-colors
          ${fracMode
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'}
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {fracMode ? t.ecuaciones.removeFraccion : t.ecuaciones.addFraccion}
      </button>
    </div>
  )
}
