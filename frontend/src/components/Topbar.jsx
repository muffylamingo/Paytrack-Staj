import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { useLang } from '../context/LanguageContext'

// Üst bar: karşılama + tarih + dil/tema düğmeleri + kullanıcı avatarı
export default function Topbar() {
  const { t, locale } = useLang()

  // Tarih de seçili dile göre biçimleniyor:
  //   tr-TR -> "31 Temmuz Cuma"   ·   en-US -> "Friday, July 31"
  const today = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="flex items-center justify-between border-b border-cream-300 bg-cream-50 px-6 py-4">
      <div>
        <p className="text-xs text-bark-400">{t('topbar.welcome')}</p>
        <p className="text-sm font-medium text-bark-800">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bark-600 text-xs font-semibold text-cream-50">
          OK
        </div>
      </div>
    </header>
  )
}
