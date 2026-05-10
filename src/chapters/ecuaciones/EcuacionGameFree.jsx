import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  applyOperation,
  F,
  isProgress,
  isSolved,
  normalizeOp,
  stepsRemaining,
} from './EcuacionEngine'
import { ExpressionDisplay } from './EcuacionRender'
import Chicken from './Chicken'
import Tutorial from './Tutorial'
import { UndoButton } from './EcuacionGame'
import { useLang } from '../../i18n/LanguageContext'

// En nivel 5 el alumno ya vio el preview en azul el tiempo que quiso antes de
// apretar Aplicar — no necesita el delay largo de los otros niveles.
const APPLY_DELAY_MS = 600
const RESOLVED_PULSE_MS = 400
const UNDO_COST = 4

const OP_TYPES = [
  { type: 'addX', label: '+X' },
  { type: 'subX', label: '−X' },
  { type: 'add',  label: '+' },
  { type: 'sub',  label: '−' },
  { type: 'mul',  label: '×' },
  { type: 'div',  label: '÷' },
]

export default function EcuacionGameFree({ generator, title, tutorialSlides }) {
  const navigate = useNavigate()
  const { t } = useLang()
  const exerciseIndexRef = useRef(0)
  const [state, setState] = useState(() => generator(0))
  const [feathersLost, setFeathersLost] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)
  const [errorThisExercise, setErrorThisExercise] = useState(false)
  const [pendingOp, setPendingOp] = useState(null)
  const [justResolved, setJustResolved] = useState(false)
  const [history, setHistory] = useState([])

  const [opType, setOpType] = useState(null)
  const [numStr, setNumStr] = useState('')   // numerador (acepta negativos)
  const [denStr, setDenStr] = useState('')   // denominador (opcional, ≥ 1)

  const animTimers = useRef([])

  const solved = isSolved(state)
  const locked = !!pendingOp

  // Parseo del input compuesto numerador/denominador.
  // - sin denominador (vacío) o denominador = 1 → entero
  // - con denominador > 1 → fracción Frac(num, den)
  // - numerador 0 no es válido (op identidad, no haría nada)
  const parsedNum = parseInt(numStr, 10)
  const parsedDen = denStr === '' ? 1 : parseInt(denStr, 10)
  const previewValid =
    opType &&
    Number.isFinite(parsedNum) &&
    parsedNum !== 0 &&
    Number.isFinite(parsedDen) &&
    parsedDen >= 1
  // normalizeOp evita que se renderice "+ -1" (lo flipea a "− 1")
  const previewOp = previewValid
    ? normalizeOp({
        type: opType,
        value: parsedDen === 1 ? parsedNum : F(parsedNum, parsedDen),
      })
    : null

  function clearAnimTimers() {
    animTimers.current.forEach(clearTimeout)
    animTimers.current = []
  }

  function clearInput() {
    setOpType(null)
    setNumStr('')
    setDenStr('')
  }

  function applyNow() {
    if (locked || !previewOp) return
    const op = previewOp
    const wasCorrect = isProgress(state, op)
    const snapshot = { state, errorThisExercise }
    setPendingOp(op)
    // ya teniamos el preview azul; ahora dejamos APPLY_DELAY_MS adicionales antes de mutar
    const tApply = setTimeout(() => {
      setHistory((h) => [...h, snapshot])
      setState((prev) => applyOperation(prev, op))
      setPendingOp(null)
      clearInput()
      setJustResolved(true)
      const tPulse = setTimeout(() => setJustResolved(false), RESOLVED_PULSE_MS)
      animTimers.current.push(tPulse)
      if (wasCorrect) {
        setFeathersLost((f) => f + 1)
        if (!errorThisExercise) setStreak((s) => s + 1)
      } else {
        setErrorThisExercise(true)
        setStreak(0)
      }
    }, APPLY_DELAY_MS)
    animTimers.current.push(tApply)
  }

  function undo() {
    if (locked || history.length === 0) return
    const last = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setState(last.state)
    setErrorThisExercise(last.errorThisExercise)
    setPendingOp(null)
    clearInput()
    setStreak((s) => Math.max(0, s - UNDO_COST))
  }

  useEffect(() => () => clearAnimTimers(), [])

  function nextExercise() {
    clearAnimTimers()
    exerciseIndexRef.current += 1
    setState(generator(exerciseIndexRef.current))
    setErrorThisExercise(false)
    setPendingOp(null)
    setJustResolved(false)
    setHistory([])
    clearInput()
  }

  // Mientras hay preview pero NO se aplicó aún, mostramos el preview en azul.
  // Cuando se aprieta Aplicar, pendingOp también es el mismo (transición continua).
  const displayPendingOp = pendingOp || previewOp

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4 flex flex-col items-center">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate('/ecuaciones')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          {t.back}
        </button>
        <button
          onClick={() => setShowTutorial(true)}
          className="text-red-500 hover:text-red-700 text-sm font-bold underline underline-offset-2"
        >
          {t.ecuaciones.howToPlay}
        </button>
        {streak >= 3 && (
          <div className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            <span className="text-lg">🔥</span>
            <span>{streak}</span>
          </div>
        )}
        <UndoButton
          disabled={locked || history.length === 0 || solved}
          onClick={undo}
          streak={streak}
          t={t}
        />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-700 mt-12 mb-2 text-center">
        {title}
      </h1>

      <div className="my-2">
        <Chicken
          feathersLost={feathersLost}
          victory={solved}
          stepsLeft={stepsRemaining(state)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg px-8 py-6 my-4 min-h-[100px] flex items-center">
        <ExpressionDisplay
          state={state}
          solved={solved}
          pendingOp={displayPendingOp}
          justResolved={justResolved}
        />
      </div>

      {!solved && (
        <div className="mt-2 w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center gap-3">
            <div className="text-sm text-gray-500 font-medium">
              {t.ecuaciones.enterOperation}
            </div>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <div className="flex flex-wrap justify-center gap-2">
                {OP_TYPES.map((o) => (
                  <button
                    key={o.type}
                    disabled={locked}
                    onClick={() => setOpType(o.type)}
                    className={`px-4 py-2 rounded-xl font-mono font-bold text-2xl border-2 transition-all
                      ${
                        opType === o.type
                          ? 'bg-indigo-500 text-white border-indigo-600 scale-105 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                      }
                      ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <NumberFracInput
                numStr={numStr}
                denStr={denStr}
                onNumChange={setNumStr}
                onDenChange={setDenStr}
                disabled={locked}
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={clearInput}
                disabled={locked || (!opType && !numStr && !denStr)}
                className="px-5 py-2 rounded-xl font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.ecuaciones.changeOp}
              </button>
              <button
                onClick={applyNow}
                disabled={locked || !previewValid}
                className="px-6 py-2 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg transition-all hover:scale-105"
              >
                {t.ecuaciones.apply} →
              </button>
            </div>
          </div>
        </div>
      )}

      {solved && (
        <div className="mt-4 text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {t.ecuaciones.solvedX}
          </div>
          <button
            onClick={nextExercise}
            className="mt-4 px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all hover:scale-105 text-lg shadow-lg"
          >
            {t.ecuaciones.nextExercise}
          </button>
        </div>
      )}

      {showTutorial && (
        <Tutorial slides={tutorialSlides} onClose={() => setShowTutorial(false)} />
      )}
    </div>
  )
}

// Input compuesto: numerador (acepta negativos) + denominador opcional apilado
// como una fracción visual. Si el denominador queda vacío, el valor es entero.
function NumberFracInput({ numStr, denStr, onNumChange, onDenChange, disabled }) {
  const { t } = useLang()
  const hasDen = denStr !== ''
  // Sólo permitimos signo en el numerador, dígitos en el denominador.
  const cleanNum = (s) => s.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '')
  const cleanDen = (s) => s.replace(/[^0-9]/g, '')
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex flex-col items-center w-24 px-2 py-1 rounded-xl border-2 ${
          hasDen ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 bg-white'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <input
          type="text"
          inputMode="numeric"
          value={numStr}
          disabled={disabled}
          onChange={(e) => onNumChange(cleanNum(e.target.value))}
          placeholder={t.ecuaciones.numPlaceholder}
          aria-label={t.ecuaciones.numerator}
          className="w-full font-mono font-bold text-2xl bg-transparent focus:outline-none text-center"
        />
        <div
          className={`w-full ${
            hasDen ? 'border-t-2 border-current' : 'border-t border-dashed border-gray-300'
          } my-1`}
        />
        <input
          type="text"
          inputMode="numeric"
          value={denStr}
          disabled={disabled}
          onChange={(e) => onDenChange(cleanDen(e.target.value))}
          placeholder={t.ecuaciones.denPlaceholder}
          aria-label={t.ecuaciones.denominator}
          className="w-full font-mono font-bold text-xl bg-transparent focus:outline-none text-center text-gray-600"
        />
      </div>
      <div className="text-[10px] text-gray-400 mt-1 text-center leading-tight">
        {t.ecuaciones.fracHint}
      </div>
    </div>
  )
}
