import { Link } from 'react-router-dom'

const chapters = [
  {
    id: 'fracciones',
    title: 'Fracciones',
    emoji: '🍕',
    description: 'Sumá fracciones con pizzas y chocolates',
    color: 'from-amber-400 to-orange-500',
  },
]

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-6">
      <header className="text-center mb-10 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          MateApp
        </h1>
        <p className="text-lg text-gray-500 mt-2">Matemáticas interactivas</p>
      </header>

      <div className="max-w-md mx-auto grid gap-4">
        {chapters.map((ch) => (
          <Link
            key={ch.id}
            to={`/${ch.id}`}
            className="block rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${ch.color} p-6 text-white`}>
              <span className="text-5xl block mb-3">{ch.emoji}</span>
              <h2 className="text-2xl font-bold">{ch.title}</h2>
              <p className="text-sm opacity-90 mt-1">{ch.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
