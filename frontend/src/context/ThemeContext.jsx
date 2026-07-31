import { createContext, useContext, useEffect, useState } from 'react'

/*
  Tema yönetimi (Context API)
  ---------------------------
  React'te "prop drilling" (veriyi bileşenden bileşene elden ele geçirmek)
  yorucu olur. Context, bir veriyi ağacın tepesine koyup her yerden okumamızı
  sağlar. Burada tuttuğumuz veri: tema 'light' mi 'dark' mi.

  Tema neyi değiştiriyor? Sadece <html> etiketine "dark" sınıfı ekliyoruz.
  Geri kalan her şeyi index.css'teki .dark bloğu (CSS değişkenleri) hallediyor.
*/

const ThemeContext = createContext(null)
const STORAGE_KEY = 'paytrack-theme'

// İlk açılışta hangi tema? 1) daha önce seçtiyse onu, 2) yoksa işletim
// sisteminin tercihini (Windows "Koyu mod") kullan.
function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  // Tema her değiştiğinde: <html class="dark"> aç/kapa + tarayıcı hafızasına yaz
  useEffect(() => {
    const root = document.documentElement

    // Renkleri değiştirmeden ÖNCE tüm CSS geçişlerini kapat.
    // Neden? Değeri CSS değişkeninden gelen bir özellik "transition" altındaysa,
    // tarayıcı değişken değişince rengi yeniden hesaplamıyor ve eleman eski
    // temanın renginde takılı kalıyor (index.css'teki .theme-switching notuna bak).
    root.classList.add('theme-switching')

    root.classList.toggle('dark', theme === 'dark')

    // offsetHeight okumak tarayıcıyı stilleri O ANDA hesaplamaya zorlar ("reflow").
    // Böylece yeni renkler geçişler kapalıyken hesaplanmış olur; hemen ardından
    // geçişleri geri açabiliriz. (requestAnimationFrame kullanmıyoruz: sekme
    // görünmüyorken hiç tetiklenmeyebiliyor ve geçişler kalıcı kapalı kalıyordu.)
    void root.offsetHeight

    root.classList.remove('theme-switching')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Kısayol: const { isDark, toggleTheme } = useTheme()
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme, ThemeProvider içinde kullanılmalı')
  return ctx
}
