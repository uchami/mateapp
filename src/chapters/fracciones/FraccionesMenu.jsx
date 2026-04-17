import { Link, useNavigate } from 'react-router-dom'

const submenus = [
  {
    id: 'sumas',
    title: 'Sumas',
    emoji: '➕',
    description: 'Sumá fracciones con pizzas y chocolates',
    color: 'from-green-400 to-emerald-500',
  },
  {
    id: 'restas',
    title: 'Restas',
    emoji: '➖',
    description: 'Restá fracciones con pizzas y chocolates',
    color: 'from-red-400 to-rose-500',
  },
  {
    id: 'identificar',
    title: 'Identificar la fracción',
    emoji: '🔍',
    description: 'Dibujá la fracción que te piden paso a paso',
    color: 'from-purple-400 to-violet-500',
  },
  {
    id: 'explicacion',
    title: 'Explicación',
    emoji: '📖',
    description: 'Herramienta para explicar fracciones en clase',
    color: 'from-sky-400 to-blue-500',
  },
]

export default function FraccionesMenu() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ← Volver
        </button>
      </div>

      <header className="text-center mb-10 pt-8">
        <span className="text-5xl block mb-3">🍕</span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Fracciones</h1>
        <p className="text-lg text-gray-500 mt-2">Elegí una actividad</p>
      </header>

      <div className="max-w-md mx-auto grid gap-4">
        {submenus.map((item) => (
          <Link
            key={item.id}
            to={`/fracciones/${item.id}`}
            className="block rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${item.color} p-5 text-white`}>
              <span className="text-4xl block mb-2">{item.emoji}</span>
              <h2 className="text-xl font-bold">{item.title}</h2>
              <p className="text-sm opacity-90 mt-1">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
