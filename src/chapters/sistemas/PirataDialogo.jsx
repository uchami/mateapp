import { useState, Fragment } from 'react'
import { useLang } from '../../i18n/LanguageContext'
import pirataNeutral from '../../assets/sistemas/pirata-loro-neutral.png'
import pirataHablando from '../../assets/sistemas/pirata-loro-hablando.png'
import pirataPensando from '../../assets/sistemas/pirata-loro-pensando.png'
import pirataFestejando from '../../assets/sistemas/pirata-loro-festejando.png'
import pirataTriste from '../../assets/sistemas/pirata-loro-triste.png'

const POSES = {
  neutral: pirataNeutral,
  hablando: pirataHablando,
  pensando: pirataPensando,
  festejando: pirataFestejando,
  triste: pirataTriste,
}

function renderBody(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={i} className="font-mono font-bold text-amber-700">
          {part.slice(2, -2)}
        </span>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

// Bocadillo flotante con pirata al lado. Usado para tutoriales y mensajes inline.
export function PirataBocadillo({ pose = 'hablando', children, size = 'md' }) {
  const cls = { sm: 'w-20 h-20', md: 'w-28 h-28', lg: 'w-40 h-40' }[size]
  return (
    <div className="flex items-end gap-2">
      <img src={POSES[pose]} alt="pirata" className={`${cls} object-contain drop-shadow-lg`} />
      {children && (
        <div className="relative bg-amber-50 border-2 border-amber-700 rounded-2xl px-4 py-3 shadow-lg text-amber-900 max-w-sm">
          {/* cola del bocadillo apuntando al pirata */}
          <span className="absolute -left-2 bottom-4 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-amber-700" />
          <span className="absolute -left-[6px] bottom-4 w-0 h-0 border-y-[7px] border-y-transparent border-r-[7px] border-r-amber-50" />
          {children}
        </div>
      )}
    </div>
  )
}

// Tutorial modal con slides y pirata animado.
// slides: [{ title, body, pose? }]
export default function PirataDialogo({ slides, onClose }) {
  const { t } = useLang()
  const [i, setI] = useState(0)
  const last = i === slides.length - 1
  const pose = slides[i].pose || 'hablando'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 border-4 border-amber-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        <div className="text-center text-sm text-amber-700 mb-2 font-bold">
          {i + 1} / {slides.length}
        </div>
        <div className="flex items-start gap-4 mb-4">
          <img
            src={POSES[pose]}
            alt="pirata"
            className="w-28 h-28 object-contain drop-shadow-lg flex-shrink-0"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-amber-900 mb-2">
              {slides[i].title}
            </h2>
            <div className="text-amber-800 text-base leading-relaxed">
              <p>{renderBody(slides[i].body)}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-amber-300">
          <button
            onClick={() => setI((p) => Math.max(0, p - 1))}
            disabled={i === 0}
            className="px-4 py-2 text-amber-700 hover:text-amber-900 disabled:opacity-30 font-medium"
          >
            {t.sistemas.tutorialBack}
          </button>
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === i ? 'bg-amber-700' : 'bg-amber-300'}`}
              />
            ))}
          </div>
          {last ? (
            <button
              onClick={onClose}
              className="px-5 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow"
            >
              {t.sistemas.tutorialPlay}
            </button>
          ) : (
            <button
              onClick={() => setI((p) => Math.min(slides.length - 1, p + 1))}
              className="px-4 py-2 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 shadow"
            >
              {t.sistemas.tutorialNext}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
