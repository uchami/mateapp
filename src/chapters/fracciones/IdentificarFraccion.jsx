import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FractionShape from '../../components/FractionShape'
import SuccessOverlay from '../../components/SuccessOverlay'
import { useLang } from '../../i18n/LanguageContext'

function generateProblem() {
  const shapes = ['pizza', 'chocolate']
  const shape = shapes[Math.floor(Math.random() * shapes.length)]
  const denominator = Math.floor(Math.random() * 12) + 2
  const maxUnits = 4
  const maxNumerator = maxUnits * denominator
  const numerator = Math.floor(Math.random() * maxNumerator) + 1
  return { numerator, denominator, shape }
}

export default function IdentificarFraccion() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [problem, setProblem] = useState(generateProblem)
  const [step, setStep] = useState(1)
  const [units, setUnits] = useState(null)
  const [parts, setParts] = useState(null)
  const [selections, setSelections] = useState([])
  const [feedback, setFeedback] = useState(null)

  const { numerator, denominator, shape } = problem

  function handleUnitsChange(val) {
    const n = parseInt(val)
    setUnits(n)
    setSelections(Array.from({ length: n }, () => []))
    setParts(null)
    setStep(2)
  }

  function handlePartsChange(val) {
    const n = parseInt(val)
    setParts(n)
    setSelections(Array.from({ length: units }, () => []))
    setStep(3)
  }

  function handleToggle(shapeIndex, partIndex) {
    setSelections((prev) => {
      const next = prev.map((s) => [...s])
      const current = next[shapeIndex]
      if (current.includes(partIndex)) {
        next[shapeIndex] = current.filter((p) => p !== partIndex)
      } else {
        next[shapeIndex] = [...current, partIndex]
      }
      return next
    })
  }

  function handleSetSelected(shapeIndex, newSelected) {
    setSelections((prev) => {
      const next = prev.map((s) => [...s])
      next[shapeIndex] = newSelected
      return next
    })
  }

  function handleVerify() {
    const totalSelected = selections.reduce((sum, s) => sum + s.length, 0)
    const correctParts = parts === denominator
    const correctCount = totalSelected === numerator
    setFeedback(correctParts && correctCount ? 'correct' : 'incorrect')
  }

  function handleNext() {
    setProblem(generateProblem())
    setStep(1)
    setUnits(null)
    setParts(null)
    setSelections([])
    setFeedback(null)
  }

  function handleRetry() {
    setFeedback(null)
    setSelections(Array.from({ length: units }, () => []))
  }

  const totalSelected = selections.reduce((sum, s) => sum + s.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-violet-100 p-4 flex flex-col items-center">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/fracciones')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          {t.back}
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-700 mb-2 mt-10">{t.identificar.title}</h2>

      {/* Fraction to represent */}
      <div className="bg-white rounded-2xl shadow-lg px-8 py-4 mb-6 flex items-center gap-3">
        <span className="text-4xl font-bold text-violet-600">
          <span className="inline-flex flex-col items-center">
            <span className="border-b-2 border-violet-600 px-2">{numerator}</span>
            <span className="px-2">{denominator}</span>
          </span>
        </span>
        <span className="text-2xl text-gray-400 mx-3">=</span>
        <span className="text-2xl text-gray-400">
          {step === 3 ? `${totalSelected}/${parts ?? '?'}` : '( ? )'}
        </span>
      </div>

      {/* Wizard steps */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Left: questions */}
        <div className="flex flex-col gap-4 md:w-72 shrink-0">
          {/* Step 1 */}
          <div className={`bg-white rounded-xl shadow p-4 ${step >= 1 ? '' : 'opacity-40'}`}>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              {t.identificar.q1(shape)}
            </p>
            <select
              value={units ?? ''}
              onChange={(e) => handleUnitsChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="" disabled>{t.identificar.choose}</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Step 2 */}
          <div className={`bg-white rounded-xl shadow p-4 ${step >= 2 ? '' : 'opacity-40 pointer-events-none'}`}>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              {t.identificar.q2(shape)}
            </p>
            <select
              value={parts ?? ''}
              onChange={(e) => handlePartsChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
              disabled={step < 2}
            >
              <option value="" disabled>{t.identificar.choose}</option>
              {Array.from({ length: 19 }, (_, i) => i + 2).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Step 3 */}
          <div className={`bg-white rounded-xl shadow p-4 ${step >= 3 ? '' : 'opacity-40 pointer-events-none'}`}>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              {t.identificar.q3(numerator, shape)}
            </p>
            <p className="text-xs text-gray-400">
              {t.identificar.selected(totalSelected, numerator)}
            </p>
          </div>

          {step >= 3 && (
            <button
              onClick={handleVerify}
              className="px-6 py-3 bg-violet-500 text-white font-semibold rounded-xl
                         hover:bg-violet-600 transition-all hover:scale-105 text-lg"
            >
              {t.identificar.verify}
            </button>
          )}
        </div>

        {/* Right: shapes */}
        <div className="flex-1 flex flex-wrap gap-4 justify-center items-start">
          {units && Array.from({ length: units }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <FractionShape
                shape={shape}
                parts={parts ?? 1}
                selected={step >= 3 ? (selections[i] || []) : []}
                onToggle={step >= 3 ? (partIdx) => handleToggle(i, partIdx) : undefined}
                onSetSelected={step >= 3 ? (newSel) => handleSetSelected(i, newSel) : undefined}
                mode={step >= 3 ? 'interactive' : 'display'}
              />
              {step >= 3 && (
                <span className="mt-1 text-sm text-gray-500">
                  {(selections[i] || []).length}/{parts}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {feedback && (
        <SuccessOverlay
          isCorrect={feedback === 'correct'}
          onNext={handleNext}
          onRetry={handleRetry}
        />
      )}
    </div>
  )
}
