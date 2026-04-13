import { useState } from 'react'
import FractionShape from '../../components/FractionShape'
import SuccessOverlay from '../../components/SuccessOverlay'

export default function FraccionesExercise({ exercise, onNext }) {
  const { shape, operands, answerNumerator, answerDenominator, answerShapes, operation = '+' } = exercise
  const parts = operands[0].denominator

  // For subtraction, pre-fill the first operand so students deselect to subtract
  function getInitialSelections() {
    if (operation === '-') {
      const prefilled = Array.from({ length: operands[0].numerator }, (_, i) => i)
      return [prefilled, ...Array.from({ length: answerShapes - 1 }, () => [])]
    }
    return Array.from({ length: answerShapes }, () => [])
  }

  const [selections, setSelections] = useState(getInitialSelections)
  const [feedback, setFeedback] = useState(null) // null | 'correct' | 'incorrect'

  function handleToggle(shapeIndex, partIndex) {
    // Can only interact with shape N+1 if shape N is full
    for (let i = 0; i < shapeIndex; i++) {
      if (selections[i].length < parts) return
    }

    setSelections((prev) => {
      const next = prev.map((s) => [...s])
      const current = next[shapeIndex]
      if (current.includes(partIndex)) {
        // Deselect: also clear all shapes after this one
        next[shapeIndex] = current.filter((p) => p !== partIndex)
        for (let i = shapeIndex + 1; i < next.length; i++) {
          next[i] = []
        }
      } else {
        next[shapeIndex] = [...current, partIndex]
      }
      return next
    })
  }

  function checkAnswer() {
    const totalSelected = selections.reduce((sum, s) => sum + s.length, 0)
    if (totalSelected === answerNumerator) {
      setFeedback('correct')
    } else {
      setFeedback('incorrect')
    }
  }

  function handleRetry() {
    setFeedback(null)
    setSelections(getInitialSelections())
  }

  const totalSelected = selections.reduce((sum, s) => sum + s.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 flex flex-col items-center">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-700 mb-6 mt-4">
        {operation === '+' ? '¿Cuánto es la suma?' : '¿Cuánto es la resta?'}
      </h2>

      {/* Problem display */}
      <div className="flex items-center gap-3 flex-wrap justify-center mb-2">
        {operands.map((op, i) => (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && <span className="text-3xl font-bold text-gray-600">{operation}</span>}
            <div className="flex flex-col items-center">
              <FractionShape
                shape={shape}
                parts={parts}
                selected={Array.from({ length: op.numerator }, (_, j) => j)}
                mode="display"
              />
              <span className="mt-1 text-lg font-semibold text-gray-600">
                {op.numerator}/{op.denominator}
              </span>
            </div>
          </div>
        ))}
        <span className="text-3xl font-bold text-gray-600">=</span>
        <span className="text-3xl font-bold text-gray-500">?</span>
      </div>

      {/* Divider */}
      <div className="w-full max-w-md border-t-2 border-dashed border-gray-300 my-6" />

      {/* Answer area */}
      <p className="text-lg text-gray-500 mb-4">
        {operation === '-'
          ? 'Hacé click para quitar las porciones que se restan'
          : 'Hacé click en las porciones para armar tu respuesta'}
      </p>

      <div className="flex items-center gap-6 flex-wrap justify-center mb-4">
        {selections.map((sel, i) => {
          const isDisabled = i > 0 && selections[i - 1].length < parts
          return (
            <div key={i} className="flex flex-col items-center">
              <div className={isDisabled ? 'opacity-40 pointer-events-none' : ''}>
                <FractionShape
                  shape={shape}
                  parts={parts}
                  selected={sel}
                  onToggle={(partIdx) => handleToggle(i, partIdx)}
                  mode="interactive"
                />
              </div>
              <span className="mt-1 text-sm text-gray-500">
                {sel.length}/{parts}
              </span>
            </div>
          )
        })}
      </div>

      {/* Total and verify */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <p className="text-xl font-semibold text-gray-700">
          Tu respuesta: <span className="text-indigo-600">{totalSelected}/{answerDenominator}</span>
          {totalSelected >= parts && (
            <span className="text-gray-400 text-base ml-2">
              ({Math.floor(totalSelected / parts)} {totalSelected % parts > 0 ? `y ${totalSelected % parts}/${parts}` : totalSelected === parts ? 'entera' : 'enteras'})
            </span>
          )}
        </p>
        <button
          onClick={checkAnswer}
          disabled={operation === '+' && totalSelected === 0}
          className="px-8 py-3 bg-indigo-500 text-white font-semibold rounded-xl
                     hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all hover:scale-105 text-lg"
        >
          Verificar
        </button>
      </div>

      {/* Feedback overlay */}
      {feedback && (
        <SuccessOverlay
          isCorrect={feedback === 'correct'}
          onNext={onNext}
          onRetry={handleRetry}
        />
      )}
    </div>
  )
}
