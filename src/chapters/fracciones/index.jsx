import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exercises } from './exercises'
import FraccionesExercise from './FraccionesExercise'

export default function FraccionesChapter() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const testMode = searchParams.get('test') === 'true'

  function handleNext() {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      navigate('/')
    }
  }

  const exercise = exercises[currentIndex]

  return (
    <div key={exercise.id}>
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ← Volver
        </button>

        {testMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-2 py-1 bg-gray-800 text-white rounded text-xs disabled:opacity-30"
            >
              ←
            </button>
            <span className="px-2 py-1 bg-gray-800 text-white rounded text-xs">
              TEST
            </span>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(exercises.length - 1, i + 1))}
              disabled={currentIndex === exercises.length - 1}
              className="px-2 py-1 bg-gray-800 text-white rounded text-xs disabled:opacity-30"
            >
              →
            </button>
          </div>
        )}

        <span className="text-sm text-gray-400">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <FraccionesExercise exercise={exercise} onNext={handleNext} />
    </div>
  )
}
