import { useLang } from '../i18n/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1 bg-white/80 backdrop-blur rounded-full shadow-md p-1">
      <button
        onClick={() => setLang('es')}
        aria-label="Español"
        title="Español"
        className={`text-xl w-9 h-9 rounded-full transition-all ${
          lang === 'es' ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100 opacity-60'
        }`}
      >
        🇪🇸
      </button>
      <button
        onClick={() => setLang('en')}
        aria-label="English"
        title="English"
        className={`text-xl w-9 h-9 rounded-full transition-all ${
          lang === 'en' ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100 opacity-60'
        }`}
      >
        🇬🇧
      </button>
    </div>
  )
}
