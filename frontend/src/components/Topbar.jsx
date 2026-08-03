import { LogOut } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { useLang } from '../context/LanguageContext'
import { keycloak, ROL_MUDUR, ROL_MUHASEBE, yetkiliMi } from '../auth/keycloak'

// Kullanıcının baş harfleri: "ODAKENT Stajyer" -> "OS"
function basHarfler(ad) {
  return (ad || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join('')
}

// Üst bar: karşılama + tarih + dil/tema düğmeleri + kullanıcı + çıkış
export default function Topbar() {
  const { t, locale } = useLang()

  // Kullanıcı bilgisi doğrudan token'ın içinden geliyor — ekstra API isteği YOK.
  // (Token zaten adı, kullanıcı adını ve e-postayı taşıyor.)
  const profil = keycloak.tokenParsed || {}
  const adSoyad = profil.name || profil.preferred_username || '?'

  // Rol rozeti — kullanıcı hangi yetkiyle girdiğini görsün
  const rolAdi = yetkiliMi(ROL_MUDUR)
    ? t('topbar.roleMudur')
    : yetkiliMi(ROL_MUHASEBE)
      ? t('topbar.roleMuhasebe')
      : t('topbar.roleGoruntuleyici')

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

        {/* Giriş yapan kullanıcı */}
        <div className="flex items-center gap-2 border-l border-cream-300 pl-3">
          <div
            title={profil.email || ''}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bark-600 text-xs font-semibold text-cream-50"
          >
            {basHarfler(adSoyad)}
          </div>
          <div className="hidden text-sm sm:block">
            <div className="font-medium leading-tight text-bark-900">{adSoyad}</div>
            <div className="text-xs leading-tight text-bark-400">
              {profil.preferred_username}
              <span className="ml-1.5 rounded-full bg-cream-200 px-1.5 py-0.5 text-[10px] font-medium text-bark-600">
                {rolAdi}
              </span>
            </div>
          </div>
          <button
            onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
            title={t('topbar.logout')}
            className="rounded-lg p-2 text-bark-400 transition hover:bg-overdue-bg hover:text-overdue-tx"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
