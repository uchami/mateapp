import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLang } from '../../i18n/LanguageContext'
import MonedasContador from './MonedasContador'
import PirataDialogo, { PirataBocadillo } from './PirataDialogo'

// Layout reutilizado por todos los módulos del capítulo Sistemas.
// Props:
//   title, monedas, combo, justEarned, tutorialSlides, mensaje (opcional, jsx)
//   onUndo (opcional), undoDisabled, undoCosto, children (contenido del juego)
export default function SistemaLayout({
  title,
  monedas,
  combo,
  justEarned,
  tutorialSlides,
  mensaje,
  onCloseMensaje,
  onUndo,
  undoDisabled,
  undoCosto = 4,
  children,
}) {
  const navigate = useNavigate()
  const { t } = useLang()
  const [showTut, setShowTut] = useState(!!tutorialSlides)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 p-4 pb-32">
      <div className="flex items-center gap-3 flex-wrap mb-2 pr-24">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <button
            onClick={() => navigate('/sistemas')}
            className="text-amber-900 hover:text-amber-700 text-sm font-bold"
          >
            {t.back}
          </button>
          {tutorialSlides && (
            <button
              onClick={() => setShowTut(true)}
              className="text-red-600 hover:text-red-800 text-sm font-bold underline underline-offset-2"
            >
              {t.sistemas.howToPlay}
            </button>
          )}
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={undoDisabled}
              title={t.sistemas.undoTitle}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold shadow border transition-all
                ${undoDisabled
                  ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white text-amber-900 border-amber-700 hover:bg-amber-50 cursor-pointer'}`}
            >
              <span>↶</span>
              <span>{t.sistemas.undo}</span>
              {!undoDisabled && (
                <span className="text-xs text-orange-600">−{undoCosto}🪙</span>
              )}
            </button>
          )}
        </div>
        <MonedasContador
          monedas={monedas ?? 0}
          combo={combo ?? 1}
          justEarned={justEarned}
        />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-amber-900 mt-2 mb-3 text-center px-4">
        {title}
      </h1>

      <div className="max-w-3xl mx-auto">{children}</div>

      {mensaje && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-20">
          <PirataBocadillo pose={mensaje.pose || 'hablando'}>
            <div className="flex flex-col gap-2">
              <div>{mensaje.body}</div>
              {onCloseMensaje && (
                <button
                  onClick={onCloseMensaje}
                  className="self-end text-xs font-bold bg-amber-700 text-white px-3 py-1 rounded-full hover:bg-amber-800 transition-all"
                >
                  {t.sistemas.cerrarMensaje}
                </button>
              )}
            </div>
          </PirataBocadillo>
        </div>
      )}

      {showTut && tutorialSlides && (
        <PirataDialogo slides={tutorialSlides} onClose={() => setShowTut(false)} />
      )}
    </div>
  )
}
