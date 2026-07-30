import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ReceiptText, BarChart3 } from 'lucide-react'

// Sadece PROJEYE lazım olan menü öğeleri (template'in gereksiz demo sayfaları yok)
const nav = [
  { to: '/panel', label: 'Gösterge Paneli', icon: LayoutDashboard },
  { to: '/faturalar', label: 'Faturalar', icon: ReceiptText },
  { to: '/raporlar', label: 'Raporlar', icon: BarChart3 },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-cream-300 bg-cream-50">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-clay-500 font-semibold text-cream-50">
          ₺
        </div>
        <span className="font-serif text-2xl font-semibold text-bark-900">PayTrack</span>
      </div>

      {/* Menü */}
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-clay-500/15 text-clay-600'
                  : 'text-bark-600 hover:bg-cream-200'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Alt: kullanıcı */}
      <div className="flex items-center gap-3 border-t border-cream-300 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bark-600 text-xs font-semibold text-cream-50">
          OK
        </div>
        <div className="text-sm">
          <div className="font-medium text-bark-900">ODAKENT</div>
          <div className="text-xs text-bark-400">Stajyer</div>
        </div>
      </div>
    </aside>
  )
}
