import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  F, ZERO, addF, mulF, divF, negF, eqF, isZero, isOne, isInt, isNeg,
  generateSustitucion1, generateSustitucion2, generateSustitucion3,
  sustituirY, sustituirX,
} from './SistemaEngine'
import {
  Ecuacion, Despejada, TokensGrandes, sustitucionTokens, aXbcTokens,
  ecuacionTokens, despejadaTokens,
} from './SistemaRender'
import { TokenList } from '../ecuaciones/EcuacionRender'
import SistemaLayout from './SistemaLayout'
import useMonedas from './useMonedas'
import MiniDespeje from './MiniDespeje'
import DespejeBiVar from './DespejeBiVar'
import FracInput, { parseFrac } from './FracInput'
import { useLang } from '../../i18n/LanguageContext'

const GENERADORES = {
  'nivel-1': generateSustitucion1,
  'nivel-2': generateSustitucion2,
  'nivel-3': generateSustitucion3,
}
const pick = (v) => (Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v)

const NIVEL_ID = { 'nivel-1': 'sus-1', 'nivel-2': 'sus-2', 'nivel-3': 'sus-3' }
const NIVEL_SIGUIENTE = {
  'nivel-1': '/sistemas/sustitucion/nivel-2',
  'nivel-2': '/sistemas/sustitucion/nivel-3',
  'nivel-3': null,
}

// Pasos:
// 1.1: → sustituir → ingresarForma → despejarX → calcularY → done
// 1.2/1.3: → elegirDespeje → despejarVariable (motor bivar) → sustituir → ingresarForma → despejarX → calcularY → done

export default function Sustitucion({ nivel }) {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const elegirState = location.state?.elegirMode ? location.state : null
  const generator = GENERADORES[nivel]
  const persistId = elegirState ? 'elegir' : NIVEL_ID[nivel]
  const tutorialSlides = elegirState ? null : t.sistemas.sustitucion[nivel]?.slides
  const title = elegirState
    ? t.sistemas.elegir.title
    : t.sistemas.sustitucion[nivel]?.title || t.sistemas.sustitucion.title
  const isNivel1 = nivel === 'nivel-1'

  const [seed, setSeed] = useState(0)
  const sistema = useMemo(
    () => elegirState?.sistema || generator(),
    [generator, seed, elegirState?.sistema],
  )

  // Estado del juego
  const [paso, setPaso] = useState(isNivel1 ? 'sustituir' : 'elegirDespeje')
  // Despeje: { variable: 'X'|'Y', m, n, eqOriginal: 'eq1'|'eq2', eqOtra }
  const [despejada, setDespejada] = useState(null)
  const [aInput, setAInput] = useState('')
  const [bInput, setBInput] = useState('')
  const [cInput, setCInput] = useState('')
  const [yInput, setYInput] = useState('')
  // Inputs del paso distributiva
  const [distVarInput, setDistVarInput] = useState('') // coef de la variable tras distribuir
  const [distConstInput, setDistConstInput] = useState('') // constante tras distribuir
  const [primerValor, setPrimerValor] = useState(null) // valor de la variable no-despejada (la que sale del MiniDespeje)
  const [mensaje, setMensaje] = useState(null)
  // Historial de pasos completados, cada uno con { kind, tokens, label }
  const [historial, setHistorial] = useState([])

  const monedasCtl = useMonedas(persistId, 10)
  const { monedas, combo, justEarned, acertar, fallar, guardarProgreso } = monedasCtl

  // Inicializa la "despejada" en nivel 1 (ya viene del generador) y agrega el
  // sistema original al historial al inicio.
  useEffect(() => {
    if (isNivel1) {
      setDespejada({
        variable: 'Y',
        m: sistema.m,
        n: sistema.n,
        eqOriginal: 'eq1',
        eqOtra: sistema.eq2,
      })
    }
    setHistorial([
      {
        kind: 'sistema',
        label: t.sistemas.sistemaOriginal,
        tokens: null, // se renderiza especial
      },
    ])
  }, [seed]) // eslint-disable-line

  function mostrarMensaje(body, pose = 'hablando') {
    setMensaje({ body, pose })
  }
  function cerrarMensaje() {
    setMensaje(null)
  }

  function fracStr(f) { return f.d === 1 ? `${f.n}` : `${f.n}/${f.d}` }

  function siguienteEjercicio() {
    guardarProgreso()
    setSeed((s) => s + 1)
    setPaso(isNivel1 ? 'sustituir' : 'elegirDespeje')
    setDespejada(null)
    setAInput(''); setBInput(''); setCInput(''); setYInput('')
    setDistVarInput(''); setDistConstInput('')
    setPrimerValor(null)
    setMensaje(null)
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

  // ------ Acciones ------

  function elegirDespeje(eq, variable) {
    const ecuacion = sistema[eq]
    const otra = eq === 'eq1' ? sistema.eq2 : sistema.eq1
    setDespejada({ variable, m: null, n: null, eqOriginal: eq, eqOtra: otra })
    setPaso('despejarVariable')
  }

  function onBiVarSolved({ m, n }) {
    setDespejada((d) => ({ ...d, m, n }))
    // agregar al historial el resultado del despeje
    setHistorial((h) => [
      ...h,
      {
        kind: 'despejada',
        label: t.sistemas.pasoDespeje,
        tokens: despejadaTokens(despejada.variable, m, n),
      },
    ])
    setPaso('despejeCompleto')
    mostrarMensaje(<>{pick(t.sistemas.bienDespeje)}</>, 'festejando')
  }

  function hacerSustitucion() {
    if (!despejada) return
    // Agregar la sustitución al historial
    const tokens = sustitucionTokens(
      despejada.eqOtra,
      despejada.variable,
      despejada.m,
      despejada.n,
    )
    setHistorial((h) => [
      ...h,
      { kind: 'sustitucion', label: t.sistemas.pasoSustitucion, tokens },
    ])
    setPaso('distributiva')
    setDistVarInput(''); setDistConstInput('')
    mostrarMensaje(<>{pick(t.sistemas.sustitucionLista)}</>, 'hablando')
  }

  // Coeficientes esperados del paso distributiva.
  //   coefSustituido · (m · otraVar + n) → coefSustituido·m · otraVar  +  coefSustituido·n
  function getDistribuidaCoefs() {
    if (!despejada) return null
    const coefSustituido = despejada.variable === 'Y' ? despejada.eqOtra.b : despejada.eqOtra.a
    return {
      coefVar: mulF(coefSustituido, despejada.m),
      coefConst: mulF(coefSustituido, despejada.n),
    }
  }

  function chequearDistributiva() {
    const cv = parseFrac(distVarInput)
    const cc = parseFrac(distConstInput)
    if (!cv || !cc) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    const obj = getDistribuidaCoefs()
    if (eqF(cv, obj.coefVar) && eqF(cc, obj.coefConst)) {
      acertar()
      setHistorial((h) => [
        ...h,
        {
          kind: 'distributiva',
          label: t.sistemas.pasoDistributiva,
          tokens: distribuidaTokens(despejada, obj),
        },
      ])
      setPaso('ingresarForma')
      setAInput(''); setBInput(''); setCInput('')
      mostrarMensaje(<>{pick(t.sistemas.bienDistributiva)}</>, 'festejando')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.casiDistributiva)}</>, 'pensando')
    }
  }

  // Tokens para mostrar la ecuación luego de aplicar la distributiva:
  //   primerCoef · otraVar + coefVar · otraVar + coefConst = c
  function distribuidaTokens(d, obj) {
    const otraVar = variableResultante()
    const primerCoef = d.variable === 'Y' ? d.eqOtra.a : d.eqOtra.b
    const c = d.eqOtra.c
    const tokens = []
    // primer término
    if (!isZero(primerCoef)) {
      if (isOne(primerCoef)) tokens.push({ kind: 'text', s: otraVar })
      else if (primerCoef.n === -1 && primerCoef.d === 1) tokens.push({ kind: 'text', s: `-${otraVar}` })
      else if (isInt(primerCoef)) tokens.push({ kind: 'text', s: `${primerCoef.n}${otraVar}` })
      else {
        const sg = isNeg(primerCoef) ? '−' : null
        tokens.push({ kind: 'frac', n: Math.abs(primerCoef.n), d: primerCoef.d, sign: sg })
        tokens.push({ kind: 'text', s: otraVar })
      }
    }
    // segundo término: coefVar · otraVar
    if (!isZero(obj.coefVar)) {
      const sg = isNeg(obj.coefVar) ? '−' : '+'
      const abs = isNeg(obj.coefVar) ? { n: -obj.coefVar.n, d: obj.coefVar.d } : obj.coefVar
      tokens.push({ kind: 'text', s: sg })
      if (!isOne(abs)) {
        if (isInt(abs)) tokens.push({ kind: 'text', s: `${abs.n}${otraVar}` })
        else {
          tokens.push({ kind: 'frac', n: abs.n, d: abs.d, sign: null })
          tokens.push({ kind: 'text', s: otraVar })
        }
      } else {
        tokens.push({ kind: 'text', s: otraVar })
      }
    }
    // constante
    if (!isZero(obj.coefConst)) {
      const sg = isNeg(obj.coefConst) ? '−' : '+'
      const abs = isNeg(obj.coefConst) ? { n: -obj.coefConst.n, d: obj.coefConst.d } : obj.coefConst
      tokens.push({ kind: 'text', s: sg })
      if (isInt(abs)) tokens.push({ kind: 'text', s: `${abs.n}` })
      else tokens.push({ kind: 'frac', n: abs.n, d: abs.d, sign: null })
    }
    tokens.push({ kind: 'text', s: '=' })
    if (isInt(c)) tokens.push({ kind: 'text', s: `${c.n}` })
    else {
      const sg = isNeg(c) ? '−' : null
      tokens.push({ kind: 'frac', n: Math.abs(c.n), d: c.d, sign: sg })
    }
    return tokens
  }

  // Variable que queda en la ecuación resultante.
  function variableResultante() {
    if (!despejada) return 'X'
    return despejada.variable === 'Y' ? 'X' : 'Y'
  }

  // Coeficientes esperados de la ecuación a·{var} + b = c.
  function getEqResultanteCoefs() {
    if (!despejada) return null
    if (despejada.variable === 'Y') {
      const r = sustituirY(despejada.eqOtra, despejada.m, despejada.n)
      return { aRes: r.aRes, bRes: r.bRes, cRes: r.cRes }
    }
    const r = sustituirX(despejada.eqOtra, despejada.m, despejada.n)
    return { aRes: r.aRes, bRes: r.bRes, cRes: r.cRes }
  }

  function chequearForma() {
    const aUsr = parseFrac(aInput)
    const bUsr = parseFrac(bInput)
    const cUsr = parseFrac(cInput)
    if (!aUsr || !bUsr || !cUsr) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    const obj = getEqResultanteCoefs()
    if (eqF(aUsr, obj.aRes) && eqF(bUsr, obj.bRes) && eqF(cUsr, obj.cRes)) {
      acertar()
      // agregar al historial
      setHistorial((h) => [
        ...h,
        {
          kind: 'forma',
          label: t.sistemas.pasoForma,
          tokens: aXbcTokens(obj.aRes, obj.bRes, obj.cRes, variableResultante()),
        },
      ])
      setPaso('despejarX')
      mostrarMensaje(<>{pick(t.sistemas.bienForma)}</>, 'festejando')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.casiForma)}</>, 'pensando')
    }
  }

  function estadoMotor() {
    const obj = getEqResultanteCoefs()
    if (!obj) return null
    return {
      left: { a: obj.aRes, b: obj.bRes },
      right: { a: ZERO, b: obj.cRes },
    }
  }

  function onMotorSolved(valor) {
    setPrimerValor(valor)
    setHistorial((h) => [
      ...h,
      {
        kind: 'valor',
        label: `${variableResultante()} =`,
        tokens: valorTokens(valor),
      },
    ])
    setPaso('calcularY')
    setYInput('')
    mostrarMensaje(<>{pick(t.sistemas.ahoraOtra)}</>, 'hablando')
  }

  // Render del término fijo (no se distribuye) en el paso distributiva.
  function renderFijoPrimerTermino(d) {
    const otraVar = variableResultante()
    const primerCoef = d.variable === 'Y' ? d.eqOtra.a : d.eqOtra.b
    if (isZero(primerCoef)) return null
    let label = ''
    if (isOne(primerCoef)) label = otraVar
    else if (primerCoef.n === -1 && primerCoef.d === 1) label = `-${otraVar}`
    else if (isInt(primerCoef)) label = `${primerCoef.n}${otraVar}`
    else label = `${primerCoef.n}/${primerCoef.d}·${otraVar}`
    return <span className="text-amber-800">{label} +</span>
  }

  function valorTokens(v) {
    if (v.d === 1) return [{ kind: 'text', s: `${v.n}` }]
    const sign = v.n < 0 ? '−' : null
    return [{ kind: 'frac', n: Math.abs(v.n), d: v.d, sign }]
  }

  function chequearY() {
    const yUsr = parseFrac(yInput)
    if (!yUsr) {
      mostrarMensaje(<>{pick(t.sistemas.faltanCampos)}</>, 'pensando')
      return
    }
    // Variable a calcular ahora: la que despejamos.
    const esperado = despejada.variable === 'X' ? sistema.xSol : sistema.ySol
    if (eqF(yUsr, esperado)) {
      acertar()
      setHistorial((h) => [
        ...h,
        {
          kind: 'valor',
          label: `${despejada.variable} =`,
          tokens: valorTokens(esperado),
        },
      ])
      setPaso('done')
      mostrarMensaje(<>{t.sistemas.victoria}</>, 'festejando')
    } else {
      fallar()
      mostrarMensaje(<>{pick(t.sistemas.casiOtra)}</>, 'pensando')
    }
  }

  // ------ Render ------
  // El sistema arriba: muestra eq1, eq2; en nivel-1 la primera es la despejada;
  // en niveles 1.2/1.3, si ya hicimos despeje, mostramos la despejada en lugar
  // de la ecuación original elegida.
  function renderSistemaArriba() {
    const eq1Tokens = ecuacionTokens(sistema.eq1)
    const eq2Tokens = ecuacionTokens(sistema.eq2)
    if (isNivel1) {
      return (
        <div className="flex flex-col gap-2 items-center">
          <Despejada varName="Y" m={sistema.m} n={sistema.n} scale="md" />
          <Ecuacion eq={sistema.eq2} scale="md" />
        </div>
      )
    }
    // niveles 1.2 / 1.3
    const yaDespejado = !!despejada?.m
    return (
      <div className="flex flex-col gap-2 items-center">
        {despejada?.eqOriginal === 'eq1' && yaDespejado ? (
          <Despejada varName={despejada.variable} m={despejada.m} n={despejada.n} scale="md" />
        ) : (
          <Ecuacion
            eq={sistema.eq1}
            highlight={paso === 'elegirDespeje' && despejada?.eqOriginal === 'eq1'}
            scale="md"
          />
        )}
        {despejada?.eqOriginal === 'eq2' && yaDespejado ? (
          <Despejada varName={despejada.variable} m={despejada.m} n={despejada.n} scale="md" />
        ) : (
          <Ecuacion
            eq={sistema.eq2}
            highlight={paso === 'elegirDespeje' && despejada?.eqOriginal === 'eq2'}
            scale="md"
          />
        )}
      </div>
    )
  }

  return (
    <SistemaLayout
      title={title}
      monedas={monedas} combo={combo} justEarned={justEarned}
      tutorialSlides={tutorialSlides}
      mensaje={mensaje}
      onCloseMensaje={cerrarMensaje}
    >
      {/* Sistema */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-4 border-2 border-amber-200">
        <div className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-2 text-center">
          {t.sistemas.sistema}
        </div>
        {renderSistemaArriba()}
      </div>

      {/* PASO: elegir */}
      {paso === 'elegirDespeje' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {t.sistemas.elegiQueDespejar}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[{ eq: 'eq1', label: sistema.eq1 }, { eq: 'eq2', label: sistema.eq2 }].flatMap(({ eq, label }) =>
              ['X', 'Y'].map((v) => (
                <button
                  key={`${eq}-${v}`}
                  onClick={() => elegirDespeje(eq, v)}
                  className="px-4 py-3 bg-white border-2 border-amber-400 rounded-xl font-bold text-amber-900 hover:bg-amber-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 flex-wrap"
                >
                  <span>{t.sistemas.despejar}</span>
                  <span className="font-mono text-lg">{v}</span>
                  <span className="text-sm opacity-70">{t.sistemas.en}</span>
                  <span className="font-mono">
                    <TokenList tokens={ecuacionTokens(label)} scale={0.55} />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* PASO: despejar la variable con motor bivariable */}
      {paso === 'despejarVariable' && despejada && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {t.sistemas.despejarVariable}{' '}
            <span className="font-mono">{despejada.variable}</span>
          </div>
          <DespejeBiVar
            eq={sistema[despejada.eqOriginal]}
            variable={despejada.variable}
            onSolved={onBiVarSolved}
            onCorrect={() => acertar()}
            onWrong={() => fallar()}
          />
        </div>
      )}

      {/* PASO: despeje completo — confirmación antes de seguir */}
      {paso === 'despejeCompleto' && despejada && despejada.m && (
        <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-500 rounded-2xl p-6 mb-4 text-center">
          <div className="text-2xl font-bold text-amber-900 mb-3">
            🎉 {t.sistemas.despejeListo}
          </div>
          <div className="my-4">
            <TokensGrandes
              tokens={despejadaTokens(despejada.variable, despejada.m, despejada.n)}
              scale="xl"
              highlight
            />
          </div>
          <button
            onClick={() => setPaso('sustituir')}
            className="mt-2 px-8 py-3 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg hover:scale-105 transition-all text-lg"
          >
            {t.sistemas.continuar} →
          </button>
        </div>
      )}

      {/* PASO: sustituir */}
      {paso === 'sustituir' && despejada && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4 text-center">
          <div className="text-amber-900 font-bold mb-3">
            {t.sistemas.clickSustituir}{' '}
            <span className="font-mono text-xl">{despejada.variable}</span>
          </div>
          <button
            onClick={hacerSustitucion}
            className="px-6 py-3 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg hover:scale-105 transition-all text-lg"
          >
            ⮕ {t.sistemas.sustituirAhora}
          </button>
        </div>
      )}

      {/* PASO: resolver la distributiva */}
      {paso === 'distributiva' && despejada && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-2">
            {t.sistemas.resolveDistributiva}
          </div>
          <div className="my-4">
            <TokensGrandes
              tokens={sustitucionTokens(despejada.eqOtra, despejada.variable, despejada.m, despejada.n)}
              scale="lg"
              highlight
            />
          </div>
          <div className="text-amber-700 text-sm text-center mb-3">
            {t.sistemas.distributivaAyuda}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap text-2xl font-mono font-bold text-amber-900">
            {renderFijoPrimerTermino(despejada)}
            <FracInput value={distVarInput} onChange={setDistVarInput} placeholder="?" autoFocus />
            <span>·{variableResultante()} +</span>
            <FracInput value={distConstInput} onChange={setDistConstInput} placeholder="?" />
            <span>=</span>
            <span>{fracStr(despejada.eqOtra.c)}</span>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={chequearDistributiva}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.verificar}
            </button>
          </div>
        </div>
      )}

      {/* PASO: ingresar la nueva forma */}
      {paso === 'ingresarForma' && despejada && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {variableResultante() === 'X' ? t.sistemas.ingresaFormaX : t.sistemas.ingresaFormaY}
          </div>
          {/* Visualización de la ecuación ya distribuida, centrada y grande */}
          <div className="my-4 flex justify-center">
            <div className="animate-resolve-pulse">
              <TokensGrandes
                tokens={distribuidaTokens(despejada, getDistribuidaCoefs())}
                scale="lg"
                highlight
              />
            </div>
          </div>
          <div className="text-amber-700 text-sm text-center mb-3">
            {t.sistemas.juntaTerminos(variableResultante())}
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap text-2xl font-mono font-bold text-amber-900">
            <FracInput value={aInput} onChange={setAInput} placeholder="a" autoFocus />
            <span>·{variableResultante()} +</span>
            <FracInput value={bInput} onChange={setBInput} placeholder="b" />
            <span>=</span>
            <FracInput value={cInput} onChange={setCInput} placeholder="c" />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={chequearForma}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.verificar}
            </button>
          </div>
        </div>
      )}

      {/* PASO: despejar X (motor de ecuaciones — la variable resultante siempre se renombra a X para el motor) */}
      {paso === 'despejarX' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 font-bold mb-3">
            {variableResultante() === 'X' ? t.sistemas.despejaX
              : <>{t.sistemas.despejarVariable} <span className="font-mono">{variableResultante()}</span></>}
          </div>
          <MiniDespeje
            initialState={estadoMotor()}
            onSolved={onMotorSolved}
            onCorrect={() => acertar()}
            onWrong={() => fallar()}
            varName={variableResultante()}
          />
        </div>
      )}

      {/* PASO: calcular la otra variable */}
      {paso === 'calcularY' && despejada && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-4">
          <div className="text-center text-amber-900 mb-3 text-base md:text-lg">
            {t.sistemas.yaSabesPrefix}{' '}
            <strong className="font-mono">
              {variableResultante()}={primerValor && fracStr(primerValor)}
            </strong>
            {t.sistemas.reemplacemosLa}{' '}
            <strong className="font-mono">{variableResultante()}</strong>{' '}
            {t.sistemas.porValor}{' '}
            <strong className="font-mono">{primerValor && fracStr(primerValor)}</strong>{' '}
            {t.sistemas.enLaEcuacion}
          </div>
          <div className="my-4">
            <TokensGrandes
              tokens={despejadaTokens(despejada.variable, despejada.m, despejada.n)}
              scale="lg"
              highlight
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold text-amber-900">
            <span>{despejada.variable} =</span>
            <FracInput value={yInput} onChange={setYInput} placeholder="?" autoFocus onSubmit={chequearY} />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={chequearY}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.verificar}
            </button>
          </div>
        </div>
      )}

      {/* PASO: done */}
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
                  onClick={siguienteEjercicio}
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

      {/* HISTORIAL de pasos */}
      {historial.length > 1 && (
        <div className="bg-white/70 rounded-2xl border-2 border-amber-200 p-4">
          <div className="text-xs uppercase tracking-wider text-amber-700 font-bold mb-2">
            {t.sistemas.historial}
          </div>
          <div className="flex flex-col gap-2">
            {historial.map((h, i) => (
              <div key={i} className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-amber-700 font-semibold uppercase opacity-80 min-w-[80px]">
                  {h.label}
                </span>
                {h.kind === 'sistema' ? (
                  <div className="flex flex-col gap-0.5 font-mono">
                    {isNivel1 ? (
                      <>
                        <span className="text-sm">
                          <TokenList tokens={despejadaTokens('Y', sistema.m, sistema.n)} scale={0.55} />
                        </span>
                        <span className="text-sm">
                          <TokenList tokens={ecuacionTokens(sistema.eq2)} scale={0.55} />
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">
                          <TokenList tokens={ecuacionTokens(sistema.eq1)} scale={0.55} />
                        </span>
                        <span className="text-sm">
                          <TokenList tokens={ecuacionTokens(sistema.eq2)} scale={0.55} />
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="font-mono text-base">
                    <TokenList tokens={h.tokens} scale={0.6} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SistemaLayout>
  )
}
