import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  generateSustitucion1, generateSustitucion2,
  generateEliminacion1, generateEliminacion2,
} from './SistemaEngine'
import { Ecuacion, Despejada } from './SistemaRender'
import SistemaLayout from './SistemaLayout'
import useMonedas from './useMonedas'
import { useLang } from '../../i18n/LanguageContext'
import iconoSustitucion from '../../assets/sistemas/icono-sustitucion.png'
import iconoEliminacion from '../../assets/sistemas/icono-eliminacion.png'

// Generamos 8 sistemas variados; cada uno trae el método "recomendado" para
// usar como pista pedagógica (sin penalizar al alumno por elegir el otro).
function generarSistemasVariados() {
  const list = []
  for (let i = 0; i < 8; i++) {
    const tipo = i % 4
    if (tipo === 0) {
      const s = generateSustitucion1()
      list.push({ sistema: s, recomendado: 'sustitucion', kind: 'sus-despejada' })
    } else if (tipo === 1) {
      const s = generateEliminacion1()
      list.push({
        sistema: { eq1: s.eq1, eq2: s.eq2, xSol: s.xSol, ySol: s.ySol },
        recomendado: 'eliminacion', kind: 'eli-alineada',
      })
    } else if (tipo === 2) {
      const s = generateEliminacion2()
      list.push({
        sistema: { eq1: s.eq1, eq2: s.eq2, xSol: s.xSol, ySol: s.ySol },
        recomendado: 'eliminacion', kind: 'eli-mult',
      })
    } else {
      const s = generateSustitucion2()
      list.push({ sistema: s, recomendado: 'sustitucion', kind: 'sus-general' })
    }
  }
  return list
}

// Decide a qué nivel-solver navegar según el sistema + método elegido.
function rutaParaResolver(kind, metodo) {
  if (metodo === 'sustitucion') {
    if (kind === 'sus-despejada') return '/sistemas/sustitucion/nivel-1'
    return '/sistemas/sustitucion/nivel-2'
  }
  // eliminación
  if (kind === 'eli-alineada') return '/sistemas/eliminacion/nivel-1'
  if (kind === 'eli-mult') return '/sistemas/eliminacion/nivel-2'
  // sistemas que vienen de la generación de sustitución pueden necesitar
  // multiplicar ambas para eliminar. Usamos nivel-3 (mult dos) como fallback.
  return '/sistemas/eliminacion/nivel-3'
}

export default function ElegirMetodo() {
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const ejerciciosRef = useRef(null)
  if (!ejerciciosRef.current) ejerciciosRef.current = generarSistemasVariados()
  const ejercicios = ejerciciosRef.current

  // Si venimos de un solver, reanudamos en el sistema siguiente.
  const resumeIdx = location.state?.resumeIdx
  const [idx, setIdx] = useState(resumeIdx ?? 0)

  useEffect(() => {
    if (resumeIdx != null) {
      // limpiar el state de la URL para evitar saltos al volver atrás
      window.history.replaceState({}, '')
    }
    // eslint-disable-next-line
  }, [])

  const monedasCtl = useMonedas('elegir', 15)
  const { monedas, combo, justEarned, guardarProgreso } = monedasCtl
  const completado = idx >= ejercicios.length
  const actual = completado ? null : ejercicios[idx]

  function resolverCon(metodo) {
    const ruta = rutaParaResolver(actual.kind, metodo)
    navigate(ruta, {
      state: { elegirMode: true, sistema: actual.sistema, idx },
    })
  }

  function reiniciar() {
    ejerciciosRef.current = generarSistemasVariados()
    setIdx(0)
  }

  function volverMapa() {
    guardarProgreso()
    navigate('/sistemas')
  }

  return (
    <SistemaLayout
      title={t.sistemas.elegir.title}
      monedas={monedas} combo={combo} justEarned={justEarned}
      tutorialSlides={t.sistemas.elegir.slides}
    >
      {!completado && (
        <>
          <div className="text-center text-amber-700 text-sm mb-2">
            {t.sistemas.elegir.progreso}: {idx + 1} / {ejercicios.length}
          </div>
          <div className="bg-white rounded-2xl shadow-md p-5 mb-4 border-2 border-amber-200">
            <div className="flex flex-col gap-2 items-center">
              {actual.kind === 'sus-despejada' ? (
                <>
                  <Despejada varName="Y" m={actual.sistema.m} n={actual.sistema.n} scale="md" />
                  <Ecuacion eq={actual.sistema.eq2} scale="md" />
                </>
              ) : (
                <>
                  <Ecuacion eq={actual.sistema.eq1} scale="md" />
                  <Ecuacion eq={actual.sistema.eq2} scale="md" />
                </>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-3">
            <div className="text-center text-amber-900 font-bold mb-3">
              {t.sistemas.elegir.queMetodo}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => resolverCon('sustitucion')}
                className="px-4 py-3 rounded-xl font-bold flex flex-col items-center gap-2 transition-all border-2
                  bg-white border-amber-300 hover:bg-amber-100 hover:scale-[1.02] hover:shadow-lg"
              >
                <img src={iconoSustitucion} alt="sustitución" className="w-14 h-14 object-contain" />
                <span className="text-amber-900">{t.sistemas.metodos.sustitucion}</span>
              </button>
              <button
                onClick={() => resolverCon('eliminacion')}
                className="px-4 py-3 rounded-xl font-bold flex flex-col items-center gap-2 transition-all border-2
                  bg-white border-amber-300 hover:bg-amber-100 hover:scale-[1.02] hover:shadow-lg"
              >
                <img src={iconoEliminacion} alt="eliminación" className="w-14 h-14 object-contain" />
                <span className="text-amber-900">{t.sistemas.metodos.eliminacion}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {completado && (
        <div className="bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-500 rounded-2xl p-6 text-center mb-4">
          <div className="text-3xl font-bold text-amber-900 mb-3">
            🏴‍☠️ {t.sistemas.elegir.completado}
          </div>
          <div className="text-lg text-amber-700 mb-4">+{monedas} 🪙</div>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={reiniciar}
              className="px-5 py-2.5 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.elegir.otraTanda}
            </button>
            <button
              onClick={volverMapa}
              className="px-5 py-2.5 bg-white border-2 border-amber-700 text-amber-900 rounded-xl font-bold hover:bg-amber-50 shadow-lg hover:scale-105 transition-all"
            >
              {t.sistemas.volverMapa}
            </button>
          </div>
        </div>
      )}
    </SistemaLayout>
  )
}
