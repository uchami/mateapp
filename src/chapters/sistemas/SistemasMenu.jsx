import { useNavigate } from 'react-router-dom'
import { useLang } from '../../i18n/LanguageContext'
import {
  getMonedasTotales,
  nivelCompletado,
  progresoIsla,
  ORDEN_ISLAS,
} from './monedasStorage'

import mapaFondo from '../../assets/sistemas/mapa-fondo.jpg'
import islaDespeje from '../../assets/sistemas/isla-despeje.png'
import islaVigia from '../../assets/sistemas/isla-vigia.png'
import islaCanon from '../../assets/sistemas/isla-canon.png'
import islaTesoro from '../../assets/sistemas/isla-tesoro.png'
import barcoPirata from '../../assets/sistemas/barco-pirata.png'
import Cofre from './Cofre'
import { PirataBocadillo } from './PirataDialogo'

const ISLA_IMG = {
  'isla-despeje': islaDespeje,
  'isla-vigia': islaVigia,
  'isla-canon': islaCanon,
  'isla-tesoro': islaTesoro,
}

// Coordenadas relativas (% del contenedor) para cada isla y donde va el barco.
const POS = {
  'isla-despeje': { x: 12, y: 70 },
  'isla-vigia':   { x: 36, y: 28 },
  'isla-canon':   { x: 62, y: 70 },
  'isla-tesoro':  { x: 86, y: 30 },
}

// Todas las islas están desbloqueadas siempre — la idea es que el alumno
// pueda elegir el camino que quiera.
function islaDesbloqueada() {
  return true
}

// Ruta de entrada al primer nivel pendiente (o al primero si todo completo).
function rutaIsla(islaId) {
  const map = {
    'isla-despeje': ['sus-1', 'sus-2', 'sus-3'],
    'isla-vigia': ['graf-1'],
    'isla-canon': ['eli-1', 'eli-2', 'eli-3'],
    'isla-tesoro': ['elegir'],
  }
  const niveles = map[islaId] || []
  const idx = niveles.findIndex((n) => !nivelCompletado(n))
  const nivelObjetivo = idx === -1 ? niveles[0] : niveles[idx]
  const rutas = {
    'sus-1': '/sistemas/sustitucion/nivel-1',
    'sus-2': '/sistemas/sustitucion/nivel-2',
    'sus-3': '/sistemas/sustitucion/nivel-3',
    'graf-1': '/sistemas/grafico',
    'eli-1': '/sistemas/eliminacion/nivel-1',
    'eli-2': '/sistemas/eliminacion/nivel-2',
    'eli-3': '/sistemas/eliminacion/nivel-3',
    'elegir': '/sistemas/elegir',
  }
  return rutas[nivelObjetivo] || '/sistemas'
}

// Última isla con al menos 1 nivel completado, +1 (donde está el barco).
function posicionBarco() {
  let lastCompleted = -1
  ORDEN_ISLAS.forEach((id, idx) => {
    const { total, completados } = progresoIsla(id)
    if (total > 0 && completados >= total) lastCompleted = idx
  })
  const idx = Math.min(lastCompleted + 1, ORDEN_ISLAS.length - 1)
  return ORDEN_ISLAS[idx]
}

export default function SistemasMenu() {
  const navigate = useNavigate()
  const { t } = useLang()
  const total = getMonedasTotales()
  const islaBarco = posicionBarco()
  const todoCompleto = ORDEN_ISLAS.every((id) => {
    const { total, completados } = progresoIsla(id)
    return total > 0 && completados >= total
  })

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-200 via-blue-300 to-blue-500">
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={() => navigate('/')}
          className="text-white/90 hover:text-white text-sm font-bold drop-shadow"
        >
          {t.back}
        </button>
      </div>

      <header className="text-center pt-6 pb-2 z-20 relative">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-50 drop-shadow-md">
          {t.chapters.sistemas}
        </h1>
        <p className="text-amber-50/90 mt-1 drop-shadow">{t.sistemas.pickIsland}</p>
      </header>

      {/* Mapa */}
      <div
        className="relative mx-auto my-4 w-[95%] max-w-4xl aspect-[16/10] rounded-3xl shadow-2xl border-4 border-amber-900 overflow-hidden"
        style={{
          backgroundImage: `url(${mapaFondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* camino punteado entre islas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 62" preserveAspectRatio="none">
          <path
            d={`M ${POS['isla-despeje'].x} ${POS['isla-despeje'].y * 0.62}
                Q ${(POS['isla-despeje'].x + POS['isla-vigia'].x) / 2} 20,
                  ${POS['isla-vigia'].x} ${POS['isla-vigia'].y * 0.62}
                Q ${(POS['isla-vigia'].x + POS['isla-canon'].x) / 2} 30,
                  ${POS['isla-canon'].x} ${POS['isla-canon'].y * 0.62}
                Q ${(POS['isla-canon'].x + POS['isla-tesoro'].x) / 2} 20,
                  ${POS['isla-tesoro'].x} ${POS['isla-tesoro'].y * 0.62}`}
            stroke="#92400e"
            strokeWidth="0.6"
            strokeDasharray="1.4 1.4"
            fill="none"
            opacity="0.75"
          />
        </svg>

        {/* Islas */}
        {ORDEN_ISLAS.map((id, idx) => {
          const { x, y } = POS[id]
          const { total: tt, completados: cc } = progresoIsla(id)
          const titulo = t.sistemas.menu[idx]
          return (
            <button
              key={id}
              onClick={() => navigate(rutaIsla(id))}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-all hover:scale-110 cursor-pointer"
            >
              <img
                src={ISLA_IMG[id]}
                alt={titulo.title}
                className="w-20 md:w-28 object-contain drop-shadow-xl"
              />
              <div className="mt-1 px-2 py-0.5 bg-amber-50/90 rounded-md border border-amber-800 text-xs md:text-sm font-bold text-amber-900 whitespace-nowrap">
                {titulo.title}
              </div>
              {tt > 0 && (
                <div className="text-[10px] md:text-xs font-bold text-amber-900 bg-amber-100/90 rounded mt-0.5 px-1">
                  {cc}/{tt} ⭐
                </div>
              )}
            </button>
          )
        })}

        {/* Barco "vos estás acá" */}
        {!todoCompleto && (
          <img
            src={barcoPirata}
            alt="barco"
            style={{
              left: `${POS[islaBarco].x}%`,
              top: `${POS[islaBarco].y + 12}%`,
            }}
            className="absolute -translate-x-1/2 w-14 md:w-20 drop-shadow-lg animate-ship-sail pointer-events-none"
          />
        )}

        {/* Cofre al final */}
        <div
          className="absolute"
          style={{ left: `${POS['isla-tesoro'].x}%`, top: `${POS['isla-tesoro'].y + 22}%` }}
        >
          <div className="-translate-x-1/2">
            <Cofre abierto={todoCompleto} total={total} size="sm" />
          </div>
        </div>
      </div>

      {/* Pirata abajo */}
      <div className="fixed bottom-4 left-4 z-20 hidden md:block">
        <PirataBocadillo pose={todoCompleto ? 'festejando' : 'hablando'}>
          <p className="text-sm">
            {todoCompleto ? t.sistemas.menuMascotaFin : t.sistemas.menuMascota}
          </p>
        </PirataBocadillo>
      </div>
    </div>
  )
}
