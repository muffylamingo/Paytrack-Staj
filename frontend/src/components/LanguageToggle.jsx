import { useLang } from '../context/LanguageContext'

const LANGS = [
  { code: 'tr', label: 'TR' },
  { code: 'en', label: 'EN' },
]

// TR | EN dil değiştirici (üst barda, tema anahtarının yanında)
export default function LanguageToggle() {
  const { lang, setLang, t } = useLang()

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className="flex items-center rounded-full border border-cream-300 bg-cream-200 p-0.5"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
            lang === code
              ? 'bg-clay-500 text-cream-50'
              : 'text-bark-400 hover:text-bark-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
