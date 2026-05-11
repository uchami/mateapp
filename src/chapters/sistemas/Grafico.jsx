import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  F, divF, negF, isZero, eqF,
  generateSustitucion2,
  solveSystem,
} from './SistemaEngine'
import { Ecuacion, Despejada } from './SistemaRender'
import SistemaLayout from './SistemaLayout'
import FracInput, { parseFrac } from './FracInput'
import useMonedas from './useMonedas'
import { useLang } from '../../i18n/LanguageContext'

// Convierte a·X + b·Y = c en Y = m·X + n. Devuelve null si b = 0 (recta vertical).
function despejarY(eq) {
  if (isZero(eq.b)) return null
  return { m: divF(negF(eq.a), eq.b), n: divF(eq.c, eq.b) }
}

// Calcula el rango (entero >= 5) que cubre todos los puntos relevantes.
function calcularRango(intersec, rectas) {
  let maxAbs = 5
  if (intersec && Number.isFinite(intersec.x) && Number.isFinite(intersec.y)) {
    maxAbs = Math.max(maxAbs, Math.abs(intersec.x), Math.abs(intersec.y))
  }
  for (const r of rectas) {
    if (!r) continue
    const m = r.m.n / r.m.d
    const n = r.n.n / r.n.d
    // si la pendiente es alta, en x=±5 la y se va lejos; ajustamos hasta que ambas
    // intersecciones con los bordes queden dentro del rango.
    const y5 = m * 5 + n
    const yn5 = m * -5 + n
    maxAbs = Math.max(maxAbs, Math.abs(y5), Math.abs(yn5))
  }
  // redondear hacia arriba a un entero "limpio" y agregar 1 de margen
  return Math.ceil(maxAbs + 1)
}

// Recta SVG. m y n son Frac. Dibuja con dominio adecuado al rango actual.
function Recta({ m, n, color, width = 3, animate = false, rango }) {
  const fM = m.n / m.d
  const fN = n.n / n.d
  const x1 = -rango, x2 = rango
  const y1 = fM * x1 + fN
  const y2 = fM * x2 + fN
  const SCALE = 100 / rango
  const ORG = 100
  const sx = (x) => ORG + x * SCALE
  const sy = (y) => ORG - y * SCALE
  return (
    <line
      x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)}
      stroke={color} strokeWidth={width} strokeLinecap="round"
      className={animate ? 'animate-recta-aparece' : ''}
    />
  )
}

function Plano({ interseccion, rango, children }) {
  const SCALE = 100 / rango
  const ORG = 100
  const sx = (x) => ORG + x * SCALE
  const sy = (y) => ORG - y * SCALE
  // Paso de la grilla: si rango es chico mostramos cada 1; si crece, agrupamos.
  const paso = rango <= 6 ? 1 : rango <= 12 ? 2 : Math.ceil(rango / 6)
  const ticks = []
  for (let i = -rango; i <= rango; i += paso) {
    if (i === 0) continue
    ticks.push(i)
  }
  const grid = []
  for (const i of ticks) {
    grid.push(<line key={`v${i}`} x1={sx(i)} y1={sy(-rango)} x2={sx(i)} y2={sy(rango)} stroke="#fcd9a8" strokeWidth="0.5" />)
    grid.push(<line key={`h${i}`} x1={sx(-rango)} y1={sy(i)} x2={sx(rango)} y2={sy(i)} stroke="#fcd9a8" strokeWidth="0.5" />)
  }
  // etiquetas numéricas en los ejes
  const labels = []
  for (const i of ticks) {
    // X axis labels — debajo del eje X (en y=0)
    labels.push(
      <text key={`lx${i}`} x={sx(i)} y={sy(0) + 6} fontSize="5" textAnchor="middle" fill="#78350f" fontFamily="monospace">
        {i}
      </text>
    )
    // Y axis labels — a la izquierda del eje Y (en x=0)
    labels.push(
      <text key={`ly${i}`} x={sx(0) - 2} y={sy(i) + 1.5} fontSize="5" textAnchor="end" fill="#78350f" fontFamily="monospace">
        {i}
      </text>
    )
  }
  return (
    <svg viewBox="-15 -15 230 230" className="w-full max-w-md mx-auto bg-amber-50 rounded-2xl border-2 border-amber-300">
      {grid}
      <line x1={sx(-rango)} y1={sy(0)} x2={sx(rango)} y2={sy(0)} stroke="#92400e" strokeWidth="1" />
      <line x1={sx(0)} y1={sy(-rango)} x2={sx(0)} y2={sy(rango)} stroke="#92400e" strokeWidth="1" />
      {labels}
      <text x={sx(rango) - 2} y={sy(0) - 3} fontSize="6" fill="#92400e" fontFamily="monospace" textAnchor="end">X</text>
      <text x={sx(0) + 3} y={sy(rango) + 6} fontSize="6" fill="#92400e" fontFamily="monospace">Y</text>
      {/* Pasamos el rango como prop al child a través de React.Children.map */}
      {children}
      {interseccion && Number.isFinite(interseccion.x) && Number.isFinite(interseccion.y) && (
        <g>
          <circle cx={sx(interseccion.x)} cy={sy(interseccion.y)} r="2.5" fill="#facc15" stroke="#b45309" strokeWidth="1" className="animate-star-twinkle" />
          <text x={sx(interseccion.x) + 4} y={sy(interseccion.y) - 2} fontSize="5" fill="#92400e" fontFamily="monospace">
            ({interseccion.x.toFixed(1)}, {interseccion.y.toFixed(1)})
          </text>
        </g>
      )}
    </svg>
  )
}

export default function Grafico() {
  const { t } = useLang()
  const navigate = useNavigate()
  const monedasCtl = useMonedas('graf-1', 5)
  const { monedas, combo, justEarned, acertar, guardarProgreso } = monedasCtl
  const [pantalla, setPantalla] = useState(1)
  // Pantalla 1: una ecuación, mostrar recta al despejar
  const sistema1 = useMemo(() => generateSustitucion2(), [])
  const [revelada1, setRevelada1] = useState(false)

  // Pantalla 2: dos ecuaciones, mostrar ambas + intersección
  const [reveladas2, setReveladas2] = useState({ a: false, b: false })

  // Pantalla 3: sandbox
  const [eqA, setEqA] = useState({ a: '1', b: '1', c: '4' })
  const [eqB, setEqB] = useState({ a: '1', b: '-1', c: '0' })
  function parseEq(eq) {
    const a = parseFrac(eq.a), b = parseFrac(eq.b), c = parseFrac(eq.c)
    if (!a || !b || !c) return null
    return { a, b, c }
  }
  const eqApars = parseEq(eqA)
  const eqBpars = parseEq(eqB)
  const desA = eqApars && despejarY(eqApars)
  const desB = eqBpars && despejarY(eqBpars)
  const interSandbox = useMemo(() => {
    if (!eqApars || !eqBpars) return null
    const r = solveSystem(eqApars, eqBpars)
    if (!r) return null
    return { x: r.x.n / r.x.d, y: r.y.n / r.y.d }
  }, [eqApars, eqBpars])

  function siguiente() {
    if (pantalla === 1) acertar()
    if (pantalla === 2) acertar()
    setPantalla((p) => Math.min(p + 1, 3))
  }

  function finalizar() {
    acertar()
    guardarProgreso()
    navigate('/sistemas')
  }

  const despeje1 = despejarY(sistema1.eq1)
  const despejeA2 = despejarY(sistema1.eq1)
  const despejeB2 = despejarY(sistema1.eq2)
  const inter2 = solveSystem(sistema1.eq1, sistema1.eq2)

  return (
    <SistemaLayout
      title={t.sistemas.grafico.title}
      monedas={monedas} combo={combo} justEarned={justEarned}
      tutorialSlides={t.sistemas.grafico.slides}
    >
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            onClick={() => setPantalla(p)}
            className={`px-4 py-1 rounded-full font-bold text-sm transition-all border-2
              ${pantalla === p
                ? 'bg-amber-700 text-white border-amber-900'
                : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-100'}`}
          >
            {p}. {t.sistemas.grafico.tabs[p - 1]}
          </button>
        ))}
      </div>

      {pantalla === 1 && (
        <div className="bg-white rounded-2xl shadow-md p-5 border-2 border-amber-200 flex flex-col items-center gap-3">
          <Ecuacion eq={sistema1.eq1} scale="md" />
          {despeje1 && (
            <Despejada varName="Y" m={despeje1.m} n={despeje1.n} scale="sm" />
          )}
          {!revelada1 ? (
            <button
              onClick={() => { setRevelada1(true); acertar() }}
              className="px-6 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow"
            >
              {t.sistemas.grafico.graficar}
            </button>
          ) : (
            <PlanoConRectas
              rectas={despeje1 ? [{ ...despeje1, color: '#0ea5e9' }] : []}
              animate
            />
          )}
          {revelada1 && (
            <button
              onClick={siguiente}
              className="mt-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
            >
              {t.sistemas.siguiente} →
            </button>
          )}
        </div>
      )}

      {pantalla === 2 && (
        <div className="bg-white rounded-2xl shadow-md p-5 border-2 border-amber-200 flex flex-col items-center gap-3">
          <div className="flex flex-col gap-2 items-center">
            <Ecuacion eq={sistema1.eq1} scale="sm" />
            <Ecuacion eq={sistema1.eq2} scale="sm" />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {!reveladas2.a && despejeA2 && (
              <button
                onClick={() => { setReveladas2((r) => ({ ...r, a: true })); acertar() }}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 text-sm"
              >
                {t.sistemas.grafico.graficarA}
              </button>
            )}
            {reveladas2.a && !reveladas2.b && despejeB2 && (
              <button
                onClick={() => { setReveladas2((r) => ({ ...r, b: true })); acertar() }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 text-sm"
              >
                {t.sistemas.grafico.graficarB}
              </button>
            )}
          </div>
          <PlanoConRectas
            rectas={[
              reveladas2.a && despejeA2 ? { ...despejeA2, color: '#0ea5e9' } : null,
              reveladas2.b && despejeB2 ? { ...despejeB2, color: '#e11d48' } : null,
            ].filter(Boolean)}
            interseccion={reveladas2.a && reveladas2.b && inter2 ? { x: inter2.x.n / inter2.x.d, y: inter2.y.n / inter2.y.d } : null}
            animate
          />
          {reveladas2.a && reveladas2.b && (
            <button
              onClick={siguiente}
              className="mt-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700"
            >
              {t.sistemas.siguiente} →
            </button>
          )}
        </div>
      )}

      {pantalla === 3 && (
        <div className="bg-white rounded-2xl shadow-md p-5 border-2 border-amber-200 flex flex-col items-center gap-4">
          <div className="text-amber-900 text-sm font-bold">{t.sistemas.grafico.sandboxTitle}</div>
          <SandboxRow label="A" eq={eqA} setEq={setEqA} color="#0ea5e9" />
          <SandboxRow label="B" eq={eqB} setEq={setEqB} color="#e11d48" />
          <PlanoConRectas
            rectas={[
              desA ? { ...desA, color: '#0ea5e9' } : null,
              desB ? { ...desB, color: '#e11d48' } : null,
            ].filter(Boolean)}
            interseccion={interSandbox}
          />
          <button
            onClick={finalizar}
            className="mt-2 px-6 py-3 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg"
          >
            {t.sistemas.volverMapa}
          </button>
        </div>
      )}
    </SistemaLayout>
  )
}

// Wrapper que calcula el rango una vez y se lo pasa a las rectas y al plano.
function PlanoConRectas({ rectas = [], interseccion = null, animate = false }) {
  const rango = calcularRango(interseccion, rectas)
  return (
    <Plano interseccion={interseccion} rango={rango}>
      {rectas.map((r, i) => (
        <Recta key={i} m={r.m} n={r.n} color={r.color} animate={animate} rango={rango} />
      ))}
    </Plano>
  )
}

function SandboxRow({ label, eq, setEq, color }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-bold w-6 text-center" style={{ color }}>{label}</span>
      <FracInput value={eq.a} onChange={(v) => setEq({ ...eq, a: v })} placeholder="a" />
      <span className="font-mono text-amber-900">X +</span>
      <FracInput value={eq.b} onChange={(v) => setEq({ ...eq, b: v })} placeholder="b" />
      <span className="font-mono text-amber-900">Y =</span>
      <FracInput value={eq.c} onChange={(v) => setEq({ ...eq, c: v })} placeholder="c" />
    </div>
  )
}
