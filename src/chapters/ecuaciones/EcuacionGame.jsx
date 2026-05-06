import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  applyOperation,
  correctOp,
  formatOp,
  formatSide,
  getOptions,
  isSolved,
  stepsRemaining,
} from './EcuacionEngine'
import Chicken from './Chicken'
import Tutorial from './Tutorial'
import { useLang } from '../../i18n/LanguageContext'

function opEquals(a, b) {
  return a && b && a.type === b.type && a.value === b.value
}

// level: 1 | 2 | 3
// generator: () => state inicial
// title, tutorialSlides
export default function EcuacionGame({ level, generator, title, tutorialSlides }) {
  const navigate = useNavigate()
  const { t } = useLang()
  const [state, setState] = useState(() => generator())
  const [feathersLost, setFeathersLost] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)
  const [pickedLeft, setPickedLeft] = useState(null)
  const [pickedRight, setPickedRight] = useState(null)
  const [vibrating, setVibrating] = useState(false)
  const [warning, setWarning] = useState(false)
  const [errorThisExercise, setErrorThisExercise] = useState(false)

  const solved = isSolved(state)
  const options = useMemo(() => (solved ? [] : getOptions(state)), [state, solved])

  // efecto: cuando hay dos picks (niveles 2/3), validar
  useEffect(() => {
    if (level === 1) return
    if (!pickedLeft || !pickedRight) return

    if (opEquals(pickedLeft, pickedRight)) {
      // misma op a ambos lados -> aplicar
      const wasCorrect = opEquals(pickedLeft, correctOp(state))
      const next = applyOperation(state, pickedLeft)
      setState(next)
      setWarning(false)
      if (wasCorrect) {
        setFeathersLost((f) => f + 1)
        if (!errorThisExercise) setStreak((s) => s + 1)
      } else {
        setErrorThisExercise(true)
        setStreak(0)
      }
      setPickedLeft(null)
      setPickedRight(null)
    } else {
      // distintas -> vibrar y avisar
      setVibrating(true)
      setWarning(true)
      const t1 = setTimeout(() => setVibrating(false), 500)
      const t2 = setTimeout(() => {
        setPickedLeft(null)
        setPickedRight(null)
      }, 500)
      const t3 = setTimeout(() => setWarning(false), 2200)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedLeft, pickedRight])

  function handleSingleSide(op) {
    // nivel 1: aplica directo
    const wasCorrect = opEquals(op, correctOp(state))
    const next = applyOperation(state, op)
    setState(next)
    if (wasCorrect) {
      setFeathersLost((f) => f + 1)
      if (!errorThisExercise) setStreak((s) => s + 1)
    } else {
      setErrorThisExercise(true)
      setStreak(0)
    }
  }

  function nextExercise() {
    setState(generator())
    setPickedLeft(null)
    setPickedRight(null)
    setErrorThisExercise(false)
    setWarning(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-4 flex flex-col items-center">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
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
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-700 mt-12 mb-2 text-center">
        {title}
      </h1>

      {/* Gallina */}
      <div className="my-2">
        <Chicken
          feathersLost={feathersLost}
          victory={solved}
          stepsLeft={stepsRemaining(state)}
        />
      </div>

      {/* Expresion */}
      <div className="bg-white rounded-2xl shadow-lg px-8 py-6 my-4">
        <ExpressionDisplay state={state} solved={solved} />
      </div>

      {/* Warning para niveles 2/3 */}
      {warning && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg my-2 text-sm font-medium animate-shake">
          {t.ecuaciones.sameOpWarning}
        </div>
      )}

      {/* Opciones */}
      {!solved && (
        <div className="mt-2 w-full max-w-2xl">
          {level === 1 ? (
            <SingleColumnOptions options={options} onPick={handleSingleSide} />
          ) : (
            <DualColumnOptions
              options={options}
              pickedLeft={pickedLeft}
              pickedRight={pickedRight}
              onPickLeft={setPickedLeft}
              onPickRight={setPickedRight}
              vibrating={vibrating}
            />
          )}
        </div>
      )}

      {/* Resuelto */}
      {solved && (
        <div className="mt-4 text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">
            {level === 1 ? t.ecuaciones.isolatedX : t.ecuaciones.solvedX}
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

function ExpressionDisplay({ state, solved }) {
  const leftStr = formatSide(state.left)
  const rightStr = state.right ? formatSide(state.right) : null

  return (
    <div className={`text-4xl md:text-5xl font-mono font-bold text-gray-800 flex items-center gap-4 ${solved ? 'text-green-600' : ''}`}>
      <span>{leftStr}</span>
      {rightStr !== null && (
        <>
          <span>=</span>
          <span>{rightStr}</span>
        </>
      )}
    </div>
  )
}

function OptionButton({ op, onClick, selected, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 rounded-xl font-mono font-bold text-2xl border-2 transition-all
        ${selected
          ? 'bg-indigo-500 text-white border-indigo-600 scale-105 shadow-lg'
          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:scale-105'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {formatOp(op)}
    </button>
  )
}

function SingleColumnOptions({ options, onPick }) {
  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {options.map((op, i) => (
        <OptionButton key={i} op={op} onClick={() => onPick(op)} />
      ))}
    </div>
  )
}

function DualColumnOptions({ options, pickedLeft, pickedRight, onPickLeft, onPickRight, vibrating }) {
  const { t } = useLang()
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className={`flex flex-col items-center gap-3 ${vibrating ? 'animate-vibrate' : ''}`}>
        <div className="text-sm text-gray-500 font-medium">{t.ecuaciones.leftSide}</div>
        {options.map((op, i) => (
          <OptionButton
            key={i}
            op={op}
            onClick={() => onPickLeft(op)}
            selected={opEquals(pickedLeft, op)}
            disabled={vibrating}
          />
        ))}
      </div>
      <div className={`flex flex-col items-center gap-3 ${vibrating ? 'animate-vibrate' : ''}`}>
        <div className="text-sm text-gray-500 font-medium">{t.ecuaciones.rightSide}</div>
        {options.map((op, i) => (
          <OptionButton
            key={i}
            op={op}
            onClick={() => onPickRight(op)}
            selected={opEquals(pickedRight, op)}
            disabled={vibrating}
          />
        ))}
      </div>
    </div>
  )
}
