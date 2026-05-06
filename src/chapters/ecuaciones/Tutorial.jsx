import { useState, Fragment } from 'react'
import { useLang } from '../../i18n/LanguageContext'

// Renderiza un texto con marcadores **bold mono** -> <span className="font-mono font-bold">
function renderBody(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-mono font-bold">
          {part.slice(2, -2)}
        </span>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

// props: { slides: [{title, body}], onClose }
export default function Tutorial({ slides, onClose }) {
  const { t } = useLang()
  const [i, setI] = useState(0)
  const last = i === slides.length - 1

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center text-sm text-gray-400 mb-2">
          {i + 1} / {slides.length}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">
          {slides[i].title}
        </h2>
        <div className="text-gray-600 text-base leading-relaxed mb-6 min-h-[6rem]">
          <p>{renderBody(slides[i].body)}</p>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setI((p) => Math.max(0, p - 1))}
            disabled={i === 0}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-30"
          >
            {t.ecuaciones.tutorialBack}
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === i ? 'bg-indigo-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          {last ? (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600"
            >
              {t.ecuaciones.tutorialPlay}
            </button>
          ) : (
            <button
              onClick={() => setI((p) => Math.min(slides.length - 1, p + 1))}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600"
            >
              {t.ecuaciones.tutorialNext}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
