import { useState, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exercises, generateExercise } from './exercises'
import FraccionesExercise from './FraccionesExercise'
import { useLang } from '../../i18n/LanguageContext'

export default function FraccionesChapter({ mode }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [extras, setExtras] = useState([])
  const [streak, setStreak] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const testMode = searchParams.get('test') === 'true'
  const { t } = useLang()
  const nextGenIdRef = useRef(1000)

  const filtered = useMemo(() => {
    if (mode === 'sumas') return exercises.filter((e) => e.operation === '+')
    if (mode === 'restas') return exercises.filter((e) => e.operation === '-')
    return exercises
  }, [mode])

  const canGenerate = mode === 'sumas' || mode === 'restas'
  const operation = mode === 'restas' ? '-' : '+'

  function buildNextExtra(prevExercise) {
    const id = `gen-${nextGenIdRef.current++}`
    return generateExercise(operation, id, prevExercise)
  }

  function handleNext() {
    const target = currentIndex + 1
    if (target < filtered.length) {
      setCurrentIndex(target)
      return
    }
    if (!canGenerate) {
      navigate('/fracciones')
      return
    }
    const extraIdx = target - filtered.length
    if (extraIdx >= extras.length) {
      const prev = exerciseAt(target - 1)
      setExtras((prevExtras) => [...prevExtras, buildNextExtra(prev)])
    }
    setCurrentIndex(target)
  }

  function handleResult({ correct, firstTry }) {
    if (!correct) {
      setStreak(0)
    } else if (firstTry) {
      setStreak((s) => s + 1)
    }
  }

  function exerciseAt(idx) {
    if (idx < filtered.length) return filtered[idx]
    return extras[idx - filtered.length]
  }

  function goPrev() {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  function goNextTest() {
    handleNext()
  }

  const exercise = exerciseAt(currentIndex)
  const isExtra = currentIndex >= filtered.length

  if (!exercise) return null

  return (
    <div key={exercise.id}>
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate('/fracciones')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            {t.back}
          </button>
          {streak >= 3 && (
            <div className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              <span className="text-lg">🔥</span>
              <span>{streak}</span>
            </div>
          )}
        </div>

        {testMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="px-2 py-1 bg-gray-800 text-white rounded text-xs disabled:opacity-30"
            >
              ←
            </button>
            <span className="px-2 py-1 bg-gray-800 text-white rounded text-xs">
              TEST
            </span>
            <button
              onClick={goNextTest}
              disabled={!canGenerate && currentIndex >= filtered.length - 1}
              className="px-2 py-1 bg-gray-800 text-white rounded text-xs disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}

        <span className="text-sm text-gray-400">
          {isExtra
            ? `${currentIndex + 1} / ∞`
            : `${currentIndex + 1} / ${filtered.length}`}
        </span>
      </div>

      <FraccionesExercise exercise={exercise} onNext={handleNext} onResult={handleResult} />
    </div>
  )
}
