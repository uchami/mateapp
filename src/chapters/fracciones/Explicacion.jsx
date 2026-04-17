import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FractionShape from '../../components/FractionShape'

function buildSelections(numerator, denominator, shapeCount) {
  const sels = []
  let remaining = numerator
  for (let i = 0; i < shapeCount; i++) {
    const count = Math.min(remaining, denominator)
    sels.push(Array.from({ length: Math.max(0, count) }, (_, j) => j))
    remaining -= count
  }
  return sels
}

export default function Explicacion() {
  const navigate = useNavigate()
  const [modo, setModo] = useState('visualizar')
  const [tipo, setTipo] = useState('pizza')

  // Modo "Visualizar fracción"
  const [numerador, setNumerador] = useState('')
  const [denominador, setDenominador] = useState('')
  const [vizSelections, setVizSelections] = useState([])

  // Modo "Interactivo"
  const [unidades, setUnidades] = useState(1)
  const [mostrarNumero, setMostrarNumero] = useState(false)
  const [mostrarNumerador, setMostrarNumerador] = useState('')
  const [mostrarDenominador, setMostrarDenominador] = useState('')
  const [mostrarSelections, setMostrarSelections] = useState([])

  const numVal = parseInt(numerador) || 0
  const denVal = parseInt(denominador) || 0
  const mNumVal = parseInt(mostrarNumerador) || 0
  const mDenVal = parseInt(mostrarDenominador) || 0

  function handleVizNumChange(val) {
    setNumerador(val)
    const n = parseInt(val) || 0
    if (denVal >= 2 && n > 0) {
      const count = Math.ceil(n / denVal)
      setVizSelections(buildSelections(n, denVal, count))
    } else {
      setVizSelections([])
    }
  }

  function handleVizDenChange(val) {
    setDenominador(val)
    const d = parseInt(val) || 0
    if (d >= 2 && numVal > 0) {
      const count = Math.ceil(numVal / d)
      setVizSelections(buildSelections(numVal, d, count))
    } else {
      setVizSelections([])
    }
  }

  function handleVizToggle(shapeIndex, partIndex) {
    setVizSelections((prev) => {
      const next = prev.map((s) => [...s])
      if (!next[shapeIndex]) return prev
      const current = next[shapeIndex]
      if (current.includes(partIndex)) {
        next[shapeIndex] = current.filter((p) => p !== partIndex)
      } else {
        next[shapeIndex] = [...current, partIndex]
      }
      const totalSelected = next.reduce((sum, s) => sum + s.length, 0)
      setNumerador(String(totalSelected))
      return next
    })
  }

  function handleMostrarDenChange(val) {
    setMostrarDenominador(val)
    setMostrarSelections(Array.from({ length: unidades }, () => []))
  }

  function handleMostrarUnidadesChange(val) {
    const n = parseInt(val)
    setUnidades(n)
    setMostrarSelections(Array.from({ length: n }, () => []))
  }

  function handleMostrarToggle(shapeIndex, partIndex) {
    setMostrarSelections((prev) => {
      const next = prev.map((s) => [...s])
      if (!next[shapeIndex]) return prev
      const current = next[shapeIndex]
      if (current.includes(partIndex)) {
        next[shapeIndex] = current.filter((p) => p !== partIndex)
      } else {
        next[shapeIndex] = [...current, partIndex]
      }
      return next
    })
  }

  function renderVisualizar() {
    const shapesNeeded = denVal > 0 && numVal > 0 ? Math.ceil(numVal / denVal) : 0
    const validInput = denVal >= 2 && denVal <= 20 && numVal > 0
    const safeSelections = vizSelections.length >= shapesNeeded
      ? vizSelections
      : Array.from({ length: shapesNeeded }, (_, i) => vizSelections[i] || [])
    const totalSelected = safeSelections.reduce((sum, s) => sum + s.length, 0)

    return (
      <div className="flex-1 flex flex-col items-center gap-6">
        {validInput && (
          <>
            <div className="bg-white rounded-2xl shadow-lg px-8 py-4">
              <span className="text-4xl font-bold text-sky-600 inline-flex flex-col items-center">
                <span className="border-b-2 border-sky-600 px-2">{totalSelected}</span>
                <span className="px-2">{denVal}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              {Array.from({ length: shapesNeeded }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <FractionShape
                    shape={tipo}
                    parts={denVal}
                    selected={safeSelections[i] || []}
                    onToggle={(partIdx) => handleVizToggle(i, partIdx)}
                    mode="interactive"
                  />
                  <span className="mt-1 text-sm text-gray-500">
                    {(safeSelections[i] || []).length}/{denVal}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
        {!validInput && (
          <p className="text-gray-400 text-lg mt-10">
            Ingresá un numerador y denominador (2-20) para ver la representación
          </p>
        )}
      </div>
    )
  }

  function renderInteractivo() {
    const partsToShow = mDenVal >= 2 ? mDenVal : 1
    const showFraction = mostrarNumero && mDenVal >= 2 && mNumVal > 0
    const safeSelections = mostrarSelections.length >= unidades
      ? mostrarSelections
      : Array.from({ length: unidades }, (_, i) => mostrarSelections[i] || [])

    return (
      <div className="flex-1 flex flex-col items-center gap-6">
        {showFraction && (
          <div className="bg-white rounded-2xl shadow-lg px-8 py-4">
            <span className="text-4xl font-bold text-sky-600 inline-flex flex-col items-center">
              <span className="border-b-2 border-sky-600 px-2">{mNumVal}</span>
              <span className="px-2">{mDenVal}</span>
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          {Array.from({ length: unidades }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <FractionShape
                shape={tipo}
                parts={partsToShow}
                selected={safeSelections[i] || []}
                onToggle={mDenVal >= 2 ? (partIdx) => handleMostrarToggle(i, partIdx) : undefined}
                mode={mDenVal >= 2 ? 'interactive' : 'display'}
              />
              {mDenVal >= 2 && (
                <span className="mt-1 text-sm text-gray-500">
                  {(safeSelections[i] || []).length}/{partsToShow}
                </span>
              )}
            </div>
          ))}
        </div>

        {mDenVal < 2 && (
          <p className="text-gray-400 text-lg">
            Configurá las opciones de la izquierda para empezar
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100 p-4">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/fracciones')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ← Volver
        </button>
      </div>

      <h2 className="text-2xl font-bold text-gray-700 mb-6 mt-10 text-center">
        Explicación de fracciones
      </h2>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Panel de configuración */}
        <div className="md:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Modo</label>
            <select
              value={modo}
              onChange={(e) => setModo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="visualizar">Visualizar fracción</option>
              <option value="interactivo">Modo interactivo</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-gray-700"
            >
              <option value="pizza">Pizza 🍕</option>
              <option value="chocolate">Chocolate 🍫</option>
            </select>
          </div>

          {modo === 'visualizar' && (
            <>
              <div className="bg-white rounded-xl shadow p-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Numerador</label>
                <input
                  type="number"
                  min="1"
                  value={numerador}
                  onChange={(e) => handleVizNumChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-gray-700"
                  placeholder="Ej: 7"
                />
              </div>
              <div className="bg-white rounded-xl shadow p-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Denominador</label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={denominador}
                  onChange={(e) => handleVizDenChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-gray-700"
                  placeholder="Ej: 16"
                />
              </div>
            </>
          )}

          {modo === 'interactivo' && (
            <>
              <div className="bg-white rounded-xl shadow p-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Unidades</label>
                <select
                  value={unidades}
                  onChange={(e) => handleMostrarUnidadesChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-gray-700"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <label className="block text-sm font-semibold text-gray-600 mb-1">Denominador</label>
                <select
                  value={mDenVal || ''}
                  onChange={(e) => handleMostrarDenChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-gray-700"
                >
                  <option value="" disabled>Elegí...</option>
                  {Array.from({ length: 19 }, (_, i) => i + 2).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white rounded-xl shadow p-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={mostrarNumero}
                    onChange={(e) => setMostrarNumero(e.target.checked)}
                    className="rounded"
                  />
                  Escribir un número en la pizarra
                </label>
              </div>

              {mostrarNumero && (
                <div className="bg-white rounded-xl shadow p-4">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Numerador</label>
                  <input
                    type="number"
                    min="1"
                    value={mostrarNumerador}
                    onChange={(e) => setMostrarNumerador(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-gray-700"
                    placeholder="Ej: 3"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Área de visualización */}
        {modo === 'visualizar' ? renderVisualizar() : renderInteractivo()}
      </div>
    </div>
  )
}
