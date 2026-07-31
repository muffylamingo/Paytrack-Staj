import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import tr from '../i18n/tr'
import en from '../i18n/en'
import { setLocale } from '../lib/format'

/*
  Çoklu dil (i18n = internationalization; "i" + 18 harf + "n")
  -----------------------------------------------------------
  Metinleri bileşenlerin içine yazmak yerine sözlük dosyalarında topluyoruz
  (i18n/tr.js, i18n/en.js) ve `t('nav.invoices')` ile çağırıyoruz.

  Gerçek projelerde genelde `react-i18next` kütüphanesi kullanılır (çoğul
  kuralları, tarih biçimleri, dosya bölme gibi işleri de halleder). Burada
  mantığı görebilmek için küçük bir sürümünü kendimiz yazdık — Theme ve Toast
  ile aynı Context kalıbı.

  ÖNEMLİ: Veriyi çevirmiyoruz, GÖSTERİMİ çeviriyoruz. Veritabanında kategori
  "Yazılım" olarak durur; İngilizce arayüzde "Software" YAZILIR ama gönderilen
  değer yine "Yazılım"dır. Yoksa veritabanı iki dilli hale gelir = kaos.
*/

const LanguageContext = createContext(null)
const STORAGE_KEY = 'paytrack-lang'

const DICTS = { tr, en }
const LOCALES = { tr: 'tr-TR', en: 'en-US' }

function getInitialLang() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && DICTS[saved]) return saved
  // Tarayıcı dili Türkçe ise TR, değilse EN
  return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

// 'nav.invoices' -> dict.nav.invoices
function resolve(dict, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), dict)
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  // DİKKAT: Bu satır bilerek useEffect'in İÇİNDE DEĞİL.
  // useEffect render'dan SONRA çalışır; oraya koyunca dili değiştirdiğimiz ilk
  // render'da para/tarih hâlâ eski biçimde çiziliyordu (bir adım geride kalıyordu).
  // Burada, çocuklar çizilmeden önce ayarlıyoruz.
  setLocale(LOCALES[lang])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang        // erişilebilirlik + tarayıcı çevirisi için
  }, [lang])

  const t = useCallback(
    (key, vars) => {
      // Anahtar seçili dilde yoksa Türkçeye, o da yoksa anahtarın kendisine düş
      let text = resolve(DICTS[lang], key) ?? resolve(tr, key) ?? key
      if (vars && typeof text === 'string') {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, value)
        }
      }
      return text
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, t, locale: LOCALES[lang] }),
    [lang, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang, LanguageProvider içinde kullanılmalı')
  return ctx
}
