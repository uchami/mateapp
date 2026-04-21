import { useEffect, useState } from 'react'
import { getRandomMeme } from '../utils/memes'
import { useLang } from '../i18n/LanguageContext'

export default function SuccessOverlay({ isCorrect, onNext, onRetry }) {
  const [memeUrl, setMemeUrl] = useState(null)
  const { t } = useLang()

  useEffect(() => {
    const type = isCorrect ? 'correcta' : 'incorrecta'
    setMemeUrl(getRandomMeme(type))
  }, [isCorrect])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Confetti */}
      {isCorrect && <Confetti />}

      <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div className="text-5xl mb-3">
          {isCorrect ? '🎉' : '😅'}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isCorrect ? t.overlay.correct : t.overlay.incorrect}
        </h2>

        {memeUrl && (
          <img
            src={memeUrl}
            alt="meme"
            className="w-full rounded-lg mb-4 max-h-64 object-contain"
          />
        )}

        <button
          onClick={isCorrect ? onNext : onRetry}
          className={`px-6 py-3 rounded-xl text-white font-semibold text-lg transition-transform hover:scale-105 ${
            isCorrect
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isCorrect ? t.overlay.next : t.overlay.retry}
        </button>
      </div>
    </div>
  )
}

function Confetti() {
  const pieces = Array.from({ length: 30 })
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#FFD93D', '#C084FC']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 2
        const duration = 2 + Math.random() * 2
        const color = colors[i % colors.length]
        const size = 6 + Math.random() * 8
        return (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${left}%`,
              top: '-20px',
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        )
      })}
    </div>
  )
}
