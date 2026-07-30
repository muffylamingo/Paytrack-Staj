import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

// Aydınlık / karanlık mod düğmesi (kayan topuzlu şık anahtar)
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      aria-label="Tema değiştir"
      className="relative flex h-9 w-16 items-center rounded-full border border-cream-300 bg-cream-200 px-1 transition hover:border-clay-400"
    >
      {/* Kayan topuz */}
      <span
        className={`absolute flex h-7 w-7 items-center justify-center rounded-full bg-clay-500 text-cream-50 shadow-sm transition-transform duration-300 ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon size={15} /> : <Sun size={15} />}
      </span>

      {/* Arkadaki soluk ikonlar (hangi tarafa gideceğini gösterir) */}
      <span className="flex w-full justify-between px-1.5 text-bark-400">
        <Sun size={13} className={isDark ? 'opacity-60' : 'opacity-0'} />
        <Moon size={13} className={isDark ? 'opacity-0' : 'opacity-60'} />
      </span>
    </button>
  )
}
