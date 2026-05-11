import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  F, ZERO, addF, mulF, divF, eqF, isZero, isInt, isNeg, isOne,
  generateEliminacion1, generateEliminacion2, generateEliminacion3,
  mulEq, addEq,
} from './SistemaEngine'
import { Ecuacion, ecuacionTokens, aXbcTokens } from './SistemaRender'
import { TokenList } from '../ecuaciones/EcuacionRender'
import SistemaLayout from './SistemaLayout'
import useMonedas from './useMonedas'
import FracInput, { parseFrac } from './FracInput'
import MiniDespeje from './MiniDespeje'
import { useLang } from '../../i18n/LanguageContext'

const GENERADORES = {
  'nivel-1': generateEliminacion1,
  'nivel-2': generateEliminacion2,
  'nivel-3': generateEliminacion3,
}
const pick = (v) => (Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v)

const NIVEL_ID = {
  'nivel-1': 'eli-1', 'nivel-2': 'eli-2', 'nivel-3': 'eli-3',
}
const NIVEL_SIGUIENTE = {
  'nivel-1': '/sistemas/eliminacion/nivel-2',
  'nivel-2': '/sistemas/eliminacion/nivel-3',
  'nivel-3': null,
}

// Pasos:
// 3.1 (sin multiplicar): → ingresarSuma → despejarDirecto → formaFinal → despejarFinal → done
// 3.2 (mult una):       → multUna → ingresarSuma → despejarDirecto → formaFinal → despejarFinal → done
// 3.3 (mult dos):       → multDos → ingresarSuma → despejarDirecto → formaFinal → despejarFinal → done

export default function Eliminacion({ nivel }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const elegirState = location.state?.elegirMode ? location.state : null
  const generator = GENERADORES[nivel]
  const persistId = elegirState ? 'elegir' : NIVEL_ID[nivel]
  const tutorialSlides = elegirState ? null : t.sistemas.eliminacion[nivel]?.slides
  const title = elegirState
    ? t.sistemas.elegir.title
    : t.sistemas.eliminacion[nivel]?.title || t.sistemas.eliminacion.title

  const [seed, setSeed] = useState(0)
  const sistema = useMemo(
    () => elegirState?.sistema || generator(),
    [generator, seed, elegirState?.sistema],
  )

  const requiereMultUna = nivel === 'nivel-2'
  const requiereMultDos = nivel === 'nivel-3'

  const [paso, setPaso] = useState(
    requiereMultUna ? 'multUna' : requiereMultDos ? 'multDos' : 'ingresarSuma'
  )
  // Ecuaciones actuales (sólo cambian cuando una multiplicación es exitosa)
  const [eq1Actual, setEq1Actual] = useState(sistema.eq1)
  const [eq2Actual, setEq2Actual] = useState(sistema.eq2)
  // Inputs de multiplicación (texto)
  const [k1Input, setK1Input] = useState('')
  const [k2Input, setK2Input] = useState('')
  // Inputs de la suma
  const [sumaA, setSumaA] = useState('')
  const [sumaB, setSumaB] = useState('')
  const [sumaC, setSumaC] = useState('')
  // Ecuación suma resuelta
  const [eqSuma, setEqSuma] = useState(null)
  const [variableEnSuma, setVariableEnSuma] = useState(null)
  const [primerValor, setPrimerValor] = useState(null)
  const [valorInput, setValorInput] = useState('')
  // Inputs de la forma final aX + b = c tras sustituir la primera variable
  const [finalAInput, setFinalAInput] = useState('')
  const [finalBInput, setFinalBInput] = useState('')
  const [finalCInput, setFinalCInput] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [cannonAnim, setCannonAnim] = useState(false)
  // Historial de pasos
  const [historial, setHistorial] = useState([])

  const monedasCtl = useMonedas(persistId, 10)
  const { monedas, combo, justEarned, acertar, fallar, guardarProgreso } = monedasCtl

  // Reset al regenerar
  useEffect(() => {
    setEq1Actual(sistema.eq1)
    setEq2Actual(sistema.eq2)
    setPaso(requiereMultUna ? 'multUna' : requiereMultDos ? 'multDos' : 'ingresarSuma')
    setK1Input(''); setK2Input('')
    setSumaA(''); setSumaB(''); setSumaC('')
    setEqSuma(null); setVariableEnSuma(null); setPrimerValor(null)
    setValorInput('')
    setFinalAInput(''); setFinalBInput(''); setFinalCInput('')
    setHistorial([{ kind: 'sistema', label: t.sistemas.sistemaOriginal }])
  }, [seed]) // eslint-disable-line

  function mostrarMensaje(body, pose = 'hablando') {
    setMensaje({ body, pose })
  }
  function cerrarMensaje() {
    setMensaje(null)
  }

  function fracStr(f) { return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}` }

  // ---------- Multiplicación con preview ----------
  // El preview muestra " · k" en azul al lado de la ecuación sin aplicar.
  // Si el k es válido y cancela, se aplica (ecuación actual cambia y entra al
  // historial). Si no cancela, NO se aplica (la ecuación queda original).

  function aplicarMultUna() {
    const k = parseFrac(k1Input)
    if (!k || isZero(k)) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    const nuevaEq1 = mulEq(sistema.eq1, k)
    const suma = addEq(nuevaEq1, sistema.eq2)
    if (isZero(suma.a) || isZero(suma.b)) {
      acertar()
      setEq1Actual(nuevaEq1)
      setHistorial((h) => [...h, { kind: 'mult', eqIdx: 1, k, eqOriginal: sistema.eq1, eqResultado: nuevaEq1 }])
      setPaso('ingresarSuma')
      mostrarMensaje(<>{pick(t.sistemas.bienMultUna)}</>, 'festejando')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.multNoCancela)}</>, 'pensando')
      // NO mutamos eq1Actual — queda la original mientras el alumno reintenta
    }
  }

  function aplicarMultDos() {
    const k1 = parseFrac(k1Input)
    const k2 = parseFrac(k2Input)
    if (!k1 || !k2 || isZero(k1) || isZero(k2)) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    const ne1 = mulEq(sistema.eq1, k1)
    const ne2 = mulEq(sistema.eq2, k2)
    const suma = addEq(ne1, ne2)
    if (isZero(suma.a) || isZero(suma.b)) {
      acertar()
      setEq1Actual(ne1)
      setEq2Actual(ne2)
      setHistorial((h) => [
        ...h,
        { kind: 'mult', eqIdx: 1, k: k1, eqOriginal: sistema.eq1, eqResultado: ne1 },
        { kind: 'mult', eqIdx: 2, k: k2, eqOriginal: sistema.eq2, eqResultado: ne2 },
      ])
      setPaso('ingresarSuma')
      mostrarMensaje(<>{pick(t.sistemas.bienMultDos)}</>, 'festejando')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.multNoCancela)}</>, 'pensando')
    }
  }

  // ---------- Suma ----------
  function chequearSuma() {
    const a = parseFrac(sumaA)
    const b = parseFrac(sumaB)
    const c = parseFrac(sumaC)
    if (!a || !b || !c) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    const objetivo = addEq(eq1Actual, eq2Actual)
    if (eqF(a, objetivo.a) && eqF(b, objetivo.b) && eqF(c, objetivo.c)) {
      acertar()
      setEqSuma(objetivo)
      setVariableEnSuma(isZero(objetivo.a) ? 'Y' : 'X')
      setHistorial((h) => [...h, { kind: 'suma', eq: objetivo }])
      setCannonAnim(true)
      setTimeout(() => setCannonAnim(false), 800)
      setTimeout(() => setPaso('despejarDirecto'), 800)
      mostrarMensaje(<>{pick(t.sistemas.boomCanon)}</>, 'festejando')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.casiSuma)}</>, 'pensando')
    }
  }

  // ---------- Despeje directo (k·var = c) ----------
  function chequearDespejeDirecto() {
    const u = parseFrac(valorInput)
    if (!u) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    const coef = variableEnSuma === 'X' ? eqSuma.a : eqSuma.b
    const esperado = divF(eqSuma.c, coef)
    if (eqF(u, esperado)) {
      acertar()
      setPrimerValor(esperado)
      setHistorial((h) => [...h, { kind: 'valor', label: variableEnSuma, val: esperado }])
      setPaso('formaFinal')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.casiOtra)}</>, 'pensando')
    }
  }

  // ---------- Calcular la otra variable ----------
  function variableQueFalta() {
    return variableEnSuma === 'X' ? 'Y' : 'X'
  }

  // Sustituyendo el primer valor en sistema.eq1, calculamos los coefs de la
  // ecuación resultante a·{varQueFalta} + b = c.
  function getFormaFinalCoefs() {
    if (!primerValor || !variableEnSuma) return null
    const eq = sistema.eq1
    if (variableEnSuma === 'X') {
      // a·v0 + b·Y = c → forma a' Y + b' = c' con a'=b, b'=a·v0, c'=c
      return { aRes: eq.b, bRes: mulF(eq.a, primerValor), cRes: eq.c }
    }
    // variableEnSuma === 'Y': a·X + b·v0 = c → a'=a, b'=b·v0, c'=c
    return { aRes: eq.a, bRes: mulF(eq.b, primerValor), cRes: eq.c }
  }

  function chequearFormaFinal() {
    const a = parseFrac(finalAInput)
    const b = parseFrac(finalBInput)
    const c = parseFrac(finalCInput)
    if (!a || !b || !c) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    const obj = getFormaFinalCoefs()
    if (!obj) return
    if (eqF(a, obj.aRes) && eqF(b, obj.bRes) && eqF(c, obj.cRes)) {
      acertar()
      setHistorial((h) => [
        ...h,
        {
          kind: 'formaFinal',
          tokens: aXbcTokens(obj.aRes, obj.bRes, obj.cRes, variableQueFalta()),
        },
      ])
      setPaso('despejarFinal')
      mostrarMensaje(<>{pick(t.sistemas.bienForma)}</>, 'festejando')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.casiForma)}</>, 'pensando')
    }
  }

  function estadoMotorFinal() {
    const obj = getFormaFinalCoefs()
    if (!obj) return null
    return {
      left: { a: obj.aRes, b: obj.bRes },
      right: { a: ZERO, b: obj.cRes },
    }
  }

  function onMotorFinalSolved(valor) {
    setHistorial((h) => [...h, { kind: 'valor', label: variableQueFalta(), val: valor }])
    setPaso('done')
    mostrarMensaje(<>{t.sistemas.victoria}</>, 'festejando')
  }

  function siguiente() {
    guardarProgreso()
    setSeed((s) => s + 1)
  }
  function volverMenu() {
    guardarProgreso()
    navigate('/sistemas')
  }
  function siguienteNivel() {
    guardarProgreso()
    const ruta = NIVEL_SIGUIENTE[nivel]
    if (ruta) navigate(ruta)
  }
  function volverAElegir() {
    guardarProgreso()
    navigate('/sistemas/elegir', { state: { resumeIdx: (elegirState?.idx ?? 0) + 1 } })
  }

  // ---------- Helpers de render ----------
  // Preview de "(lado izq) × k = (c) × k" — muestra el factor azul a ambos lados.
  function EcuacionConKPreview({ eq, kInput, kLabel = 'k', color = '#2563eb' }) {
    const k = parseFrac(kInput)
    const kRender = k && !isZero(k) ? fracStr(k) : kLabel
    const isFaded = !k || isZero(k)
    // Tokens del lado izquierdo: a·X + b·Y  (omitimos el = c, lo ponemos manual)
    const left = ecuacionTokens(eq).slice(0, -2) // quitamos "=" y la constante c
    const right = ecuacionTokens(eq).slice(-1) // la constante c
    return (
      <div className="flex items-center gap-1 flex-wrap justify-center font-mono font-bold text-2xl md:text-3xl">
        <span className="text-gray-800">(</span>
        <span className="text-gray-800"><TokenList tokens={left} /></span>
        <span className="text-gray-800">)</span>
        <span style={{ color }} className={isFaded ? 'opacity-50' : ''}>· {kRender}</span>
        <span className="text-gray-800 mx-1">=</span>
        <span className="text-gray-800">(</span>
        <span className="text-gray-800"><TokenList tokens={right} /></span>
        <span className="text-gray-800">)</span>
        <span style={{ color }} className={isFaded ? 'opacity-50' : ''}>· {kRender}</span>
      </div>
    )
  }

  // ---------- Render ----------
  // Sistema arriba — antes de aplicar K, sigue siendo el original; después de
  // aplicar mostramos las ecuaciones ya multiplicadas.
  return (
    <SistemaLayout
      title={title}
      monedas={monedas} combo={combo} justEarned={justEarned}
      tutorialSlides={tutorialSlides}
      mensaje={mensaje}
      onCloseMensaje={cerrarMensaje}
    >
      <div className="bg-white rounded-2xl shadow-md p-5 mb-4 border-2 border-amber-200">
        <div className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-2 text-center">
          {t.sistemas.sistema}
        </div>
        <div className="flex flex-col gap-2 items-center">
          {/* Si estamos en multUna y k aún no se aplicó, mostrar eq1 con preview */}
          {paso === 'multUna' ? (
            <>
              <EcuacionConKPreview eq={sistema.eq1} kInput={k1Input} />
              <Ecuacion eq={sistema.eq2} scale="md" />
            </>
          ) : paso === 'multDos' ? (
            <>
              <EcuacionConKPreview eq={sistema.eq1} kInput={k1Input} kLabel="k₁" />
              <EcuacionConKPreview eq={sistema.eq2} kInput={k2Input} kLabel="k₂" />
            </>
          ) : (
            <>
              <div className={`transition-transform ${cannonAnim ? 'animate-cannon-shake' : ''}`}>
                <Ecuacion eq={eq1Actual} scale="md" />
              </div>
              <div className={`transition-transform ${cannonAnim ? 'animate-cannon-fire' : ''}`}>
                <Ecuacion eq={eq2Actual} scale="md" />
              </div>
              {eqSuma && (
                <div className="border-t-2 border-amber-400 pt-2 mt-2 w-full flex justify-center">
                  <Ecuacion eq={eqSuma} highlight scale="md" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {paso === 'multUna' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {t.sistemas.multiplicaEq1}
          </div>
          <div className="flex items-center justify-center gap-2 text-2xl font-mono">
            <span className="text-amber-900 font-bold">k =</span>
            <FracInput value={k1Input} onChange={setK1Input} placeholder="?" autoFocus />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={aplicarMultUna}
              className="px-6 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.aplicar}
            </button>
          </div>
        </div>
      )}

      {paso === 'multDos' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {t.sistemas.multiplicaAmbas}
          </div>
          <div className="flex items-center justify-center gap-4 text-2xl font-mono">
            <div className="flex items-center gap-1">
              <span className="text-amber-900 font-bold">k₁ =</span>
              <FracInput value={k1Input} onChange={setK1Input} placeholder="?" autoFocus />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-900 font-bold">k₂ =</span>
              <FracInput value={k2Input} onChange={setK2Input} placeholder="?" />
            </div>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={aplicarMultDos}
              className="px-6 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.aplicar}
            </button>
          </div>
        </div>
      )}

      {paso === 'ingresarSuma' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {t.sistemas.ingresarSuma}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap text-2xl font-mono font-bold text-amber-900">
            <FracInput value={sumaA} onChange={setSumaA} placeholder="a" autoFocus />
            <span>·X +</span>
            <FracInput value={sumaB} onChange={setSumaB} placeholder="b" />
            <span>·Y =</span>
            <FracInput value={sumaC} onChange={setSumaC} placeholder="c" />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={chequearSuma}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-all"
            >
              💥 {t.sistemas.sumar}
            </button>
          </div>
        </div>
      )}

      {paso === 'despejarDirecto' && eqSuma && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {t.sistemas.despejaResultante}{' '}
            <span className="font-mono">{variableEnSuma}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-3xl font-mono font-bold text-amber-900">
            <span>{variableEnSuma} =</span>
            <FracInput value={valorInput} onChange={setValorInput} placeholder="?" autoFocus />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={chequearDespejeDirecto}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.verificar}
            </button>
          </div>
        </div>
      )}

      {paso === 'formaFinal' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-2">
            {t.sistemas.calculaOtra}{' '}
            <span className="font-mono">{variableQueFalta()}</span>
          </div>
          <div className="text-center text-amber-700 text-sm mb-3">
            {t.sistemas.recordatorioReemplaza}{' '}
            <span className="font-mono inline-flex align-middle">
              <TokenList tokens={ecuacionTokens(sistema.eq1)} scale={0.6} />
            </span>{' '}
            ({variableEnSuma} = <strong>{primerValor && fracStr(primerValor)}</strong>)
          </div>
          <div className="text-center text-amber-700 text-sm mb-3">
            {variableQueFalta() === 'X' ? t.sistemas.ingresaFormaX : t.sistemas.ingresaFormaY}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap text-2xl font-mono font-bold text-amber-900">
            <FracInput value={finalAInput} onChange={setFinalAInput} placeholder="a" autoFocus />
            <span>·{variableQueFalta()} +</span>
            <FracInput value={finalBInput} onChange={setFinalBInput} placeholder="b" />
            <span>=</span>
            <FracInput value={finalCInput} onChange={setFinalCInput} placeholder="c" />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={chequearFormaFinal}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.verificar}
            </button>
          </div>
        </div>
      )}

      {paso === 'despejarFinal' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {t.sistemas.despejarVariable}{' '}
            <span className="font-mono">{variableQueFalta()}</span>
          </div>
          <MiniDespeje
            initialState={estadoMotorFinal()}
            onSolved={onMotorFinalSolved}
            onCorrect={() => acertar()}
            onWrong={() => fallar()}
            varName={variableQueFalta()}
          />
        </div>
      )}

      {paso === 'done' && (
        <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-500 rounded-2xl p-6 text-center mb-4">
          <div className="text-3xl font-bold text-amber-900 mb-3">
            ⭐ {t.sistemas.tesoroEncontrado}
          </div>
          <div className="text-xl font-mono font-bold text-amber-800 mb-4">
            X = {fracStr(sistema.xSol)}, Y = {fracStr(sistema.ySol)}
          </div>
          <div className="text-lg text-amber-700 mb-4">+{monedas} 🪙</div>
          <div className="flex justify-center gap-3 flex-wrap">
            {elegirState ? (
              <button
                onClick={volverAElegir}
                className="px-5 py-2.5 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg hover:scale-105 transition-all"
              >
                {t.sistemas.siguienteSistema}
              </button>
            ) : (
              <>
                <button
                  onClick={siguiente}
                  className="px-5 py-2.5 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg hover:scale-105 transition-all"
                >
                  {t.sistemas.otroEjercicio}
                </button>
                {NIVEL_SIGUIENTE[nivel] && (
                  <button
                    onClick={siguienteNivel}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg hover:scale-105 transition-all"
                  >
                    {t.sistemas.siguienteNivel}
                  </button>
                )}
                <button
                  onClick={volverMenu}
                  className="px-5 py-2.5 bg-white border-2 border-amber-700 text-amber-900 rounded-xl font-bold hover:bg-amber-50 shadow-lg hover:scale-105 transition-all"
                >
                  {t.sistemas.volverMapa}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Historial */}
      {historial.length > 1 && (
        <div className="bg-white/70 rounded-2xl border-2 border-amber-200 p-4">
          <div className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-2">
            {t.sistemas.historial}
          </div>
          <div className="flex flex-col gap-2">
            {historial.map((h, i) => (
              <HistoryEntry key={i} entry={h} sistema={sistema} t={t} fracStr={fracStr} />
            ))}
          </div>
        </div>
      )}
    </SistemaLayout>
  )
}

function HistoryEntry({ entry, sistema, t, fracStr }) {
  if (entry.kind === 'sistema') {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-amber-700 font-semibold uppercase opacity-80 min-w-[100px]">
          {entry.label}
        </span>
        <div className="flex flex-col gap-0.5 font-mono">
          <span className="text-sm">
            <TokenList tokens={ecuacionTokens(sistema.eq1)} scale={0.55} />
          </span>
          <span className="text-sm">
            <TokenList tokens={ecuacionTokens(sistema.eq2)} scale={0.55} />
          </span>
        </div>
      </div>
    )
  }
  if (entry.kind === 'mult') {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-amber-700 font-semibold uppercase opacity-80 min-w-[100px]">
          {t.sistemas.pasoMult} eq{entry.eqIdx}
        </span>
        <span className="font-mono text-sm">
          <TokenList tokens={ecuacionTokens(entry.eqOriginal)} scale={0.55} />
        </span>
        <span className="text-blue-600 font-bold">× {fracStr(entry.k)}</span>
        <span className="text-amber-700">→</span>
        <span className="font-mono text-sm font-bold">
          <TokenList tokens={ecuacionTokens(entry.eqResultado)} scale={0.55} />
        </span>
      </div>
    )
  }
  if (entry.kind === 'formaFinal') {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-amber-700 font-semibold uppercase opacity-80 min-w-[100px]">
          {t.sistemas.pasoForma}
        </span>
        <span className="font-mono text-base">
          <TokenList tokens={entry.tokens} scale={0.6} />
        </span>
      </div>
    )
  }
  if (entry.kind === 'suma') {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-amber-700 font-semibold uppercase opacity-80 min-w-[100px]">
          {t.sistemas.pasoSuma}
        </span>
        <span className="font-mono text-base">
          <TokenList tokens={ecuacionTokens(entry.eq)} scale={0.6} />
        </span>
      </div>
    )
  }
  if (entry.kind === 'valor') {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs text-amber-700 font-semibold uppercase opacity-80 min-w-[100px]">
          {entry.label} =
        </span>
        <span className="font-mono text-base">{fracStr(entry.val)}</span>
      </div>
    )
  }
  return null
}
