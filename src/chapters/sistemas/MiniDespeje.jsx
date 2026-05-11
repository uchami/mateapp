import { useEffect, useRef, useState } from 'react'
import {
  applyOperation,
  isProgress,
  isSolved,
  getSolution,
  formatSide,
  formatOp,
} from '../ecuaciones/EcuacionEngine'
import { TokenList } from '../ecuaciones/EcuacionRender'
import ManualOpInput from './ManualOpInput'
import { useLang } from '../../i18n/LanguageContext'

const APPLY_DELAY_MS = 600
const PULSE_MS = 400

// Reemplaza la 'X' por varName en los strings de los tokens.
function rebrandTokens(tokens, varName) {
  if (varName === 'X') return tokens
  return tokens.map((t) => {
    if (t.kind !== 'text') return t
    return { ...t, s: t.s.replace(/X/g, varName) }
  })
}

function SidePart({ tokens, opTokens, justResolved, varName }) {
  const branded = rebrandTokens(tokens, varName)
  const brandedOp = opTokens ? rebrandTokens(opTokens, varName) : null
  if (brandedOp) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-blue-600 animate-paren-pop">(</span>
        <TokenList tokens={branded} />
        <span className="text-blue-600 animate-paren-pop">)</span>
        <span className="text-blue-600 animate-op-slide-in">
          <TokenList tokens={brandedOp} />
        </span>
      </span>
    )
  }
  if (justResolved) {
    return (
      <span className="animate-resolve-pulse">
        <TokenList tokens={branded} />
      </span>
    )
  }
  return <TokenList tokens={branded} />
}

function ExpressionDisplayV({ state, solved, pendingOp, justResolved, varName }) {
  const leftTokens = formatSide(state.left)
  const rightTokens = state.right ? formatSide(state.right) : null
  const opTokens = pendingOp ? formatOp(pendingOp) : null
  return (
    <div
      className={`text-3xl md:text-5xl font-mono font-bold flex items-center gap-3 flex-wrap justify-center ${
        solved ? 'text-green-600' : 'text-gray-800'
      }`}
    >
      <SidePart tokens={leftTokens} opTokens={opTokens} justResolved={justResolved} varName={varName} />
      {rightTokens !== null && (
        <>
          <span>=</span>
          <SidePart tokens={rightTokens} opTokens={opTokens} justResolved={justResolved} varName={varName} />
        </>
      )}
    </div>
  )
}

// Motor de despeje con UNA variable. Reutiliza el motor de ecuaciones existente
// pero permite ingresar la operación a mano (preview en azul) en vez de elegir
// entre botones.
export default function MiniDespeje({ initialState, onSolved, onCorrect, onWrong, varName = 'X' }) {
  const { t } = useLang()
  const [state, setState] = useState(initialState)
  const [pending, setPending] = useState(null) // op aplicándose (animación)
  const [preview, setPreview] = useState(null) // op en preview por input manual
  const [pulse, setPulse] = useState(false)
  const [aciertos, setAciertos] = useState(0)
  const [errores, setErrores] = useState(0)
  const solved = isSolved(state)
  const solvedFired = useRef(false)
  const locked = !!pending

  useEffect(() => {
    if (solved && !solvedFired.current) {
      solvedFired.current = true
      const tt = setTimeout(() => onSolved(getSolution(state), aciertos, errores), 250)
      return () => clearTimeout(tt)
    }
  }, [solved]) // eslint-disable-line

  function applyOp(op) {
    if (pending || solved) return
    const good = isProgress(state, op)
    setPending(op)
    setPreview(null)
    setTimeout(() => {
      setState((s) => applyOperation(s, op))
      setPending(null)
      setPulse(true)
      setTimeout(() => setPulse(false), PULSE_MS)
      if (good) {
        setAciertos((n) => n + 1)
        onCorrect && onCorrect()
      } else {
        setErrores((n) => n + 1)
        onWrong && onWrong()
      }
    }, APPLY_DELAY_MS)
  }

  // pending tiene prioridad (estamos animando); si no, mostramos el preview vivo.
  const displayPending = pending || preview

  const opTypes = [
    { type: 'addX', label: `+${varName}` },
    { type: 'subX', label: `−${varName}` },
    { type: 'add', label: '+' },
    { type: 'sub', label: '−' },
    { type: 'mul', label: '×' },
    { type: 'div', label: '÷' },
  ]

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="bg-white rounded-2xl shadow-lg px-6 py-4 min-h-[80px] flex items-center">
        <ExpressionDisplayV
          state={state}
          solved={solved}
          pendingOp={displayPending}
          justResolved={pulse}
          varName={varName}
        />
      </div>
      {!solved && (
        <ManualOpInput
          opTypes={opTypes}
          disabled={locked}
          onApply={applyOp}
          onPreviewChange={setPreview}
        />
      )}
      {solved && (
        <div className="text-2xl font-bold text-green-700">
          {varName} {t.sistemas.xDespejado.replace('X', '').trim() || '✓'} →
        </div>
      )}
    </div>
  )
}
