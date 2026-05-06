import { Link, useNavigate } from 'react-router-dom'
import gallinaImg from '../../assets/ecuaciones/gallinadesplumada.png'
import { useLang } from '../../i18n/LanguageContext'

const ENABLED_IDS = new Set(['nivel-1', 'nivel-2', 'nivel-3'])
const COLORS = {
  'nivel-1': 'from-amber-400 to-orange-500',
  'nivel-2': 'from-orange-400 to-rose-500',
  'nivel-3': 'from-rose-400 to-pink-600',
  'nivel-4': 'from-gray-300 to-gray-400',
  'nivel-5': 'from-gray-300 to-gray-400',
}

export default function EcuacionesMenu() {
  const navigate = useNavigate()
  const { t } = useLang()
  const niveles = t.ecuaciones.menu

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-6">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          {t.back}
        </button>
      </div>

      <header className="text-center mb-8 pt-8">
        <img
          src={gallinaImg}
          alt="gallina"
          className="w-24 h-24 mx-auto object-contain mb-2"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{t.chapters.ecuaciones}</h1>
        <p className="text-lg text-gray-500 mt-2">{t.ecuaciones.pickLevel}</p>
      </header>

      <div className="max-w-md mx-auto grid gap-4">
        {niveles.map((n) => {
          const enabled = ENABLED_IDS.has(n.id)
          const color = COLORS[n.id]
          if (enabled) {
            return (
              <Link
                key={n.id}
                to={`/ecuaciones/${n.id}`}
                className="block rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${color} p-5 text-white`}>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-bold">{n.title}</h2>
                    <span className="text-base opacity-90">· {n.subtitle}</span>
                  </div>
                  <p className="text-sm opacity-90 mt-1">{n.desc}</p>
                </div>
              </Link>
            )
          }
          return (
            <div
              key={n.id}
              className="block rounded-2xl shadow-md overflow-hidden opacity-60 cursor-not-allowed"
            >
              <div className={`bg-gradient-to-r ${color} p-5 text-white`}>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-xl font-bold">{n.title}</h2>
                  <span className="text-base opacity-90">· {n.subtitle}</span>
                  <span className="ml-auto text-xl">🔒</span>
                </div>
                <p className="text-sm opacity-90 mt-1">{n.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
