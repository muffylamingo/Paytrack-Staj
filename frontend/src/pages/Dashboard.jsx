import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, CalendarClock, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { getStats } from '../api/stats'
import { formatCurrency } from '../lib/format'

// Organic palet — grafik dilim renkleri
const PIE_COLORS = ['#C2703F', '#7A8B5A', '#6B5D4B', '#D08B5E', '#A6402C', '#9A8B78']

// "2026-07" -> "Tem"
const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
function monthLabel(key) {
  const m = Number(key.split('-')[1])
  return MONTHS_TR[m - 1] || key
}

// Gradyanlı, ikonlu KPI kartı (Purple template tarzı, organic renklerde)
function KpiCard({ label, value, sub, icon: Icon, from, to }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-cream-50 shadow-sm"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {/* dekoratif baloncuklar */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 right-10 h-20 w-20 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
        <p className="text-sm font-medium text-cream-50/90">{label}</p>
        <div className="rounded-xl bg-white/20 p-2">
          <Icon size={20} />
        </div>
      </div>
      <p className="relative mt-3 font-serif text-3xl font-semibold">{value}</p>
      {sub && <p className="relative mt-3 text-xs text-cream-50/85">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getStats().then(setStats).catch(() => setError(true))
  }, [])

  if (error)
    return <p className="text-overdue-tx">İstatistikler yüklenemedi — backend (uvicorn) çalışıyor mu?</p>
  if (!stats) return <p className="text-bark-400">Yükleniyor…</p>

  const pieData = stats.by_category.map((c) => ({ name: c.category, value: Number(c.total) }))
  const lineData = stats.monthly_trend.map((m) => ({ name: monthLabel(m.month), total: Number(m.total) }))
  const totalCat = pieData.reduce((s, d) => s + d.value, 0)

  // "Bu Ay" için geçen aya göre değişim (KPI trend oku)
  const cur = Number(stats.monthly_trend.at(-1)?.total || 0)
  const prev = Number(stats.monthly_trend.at(-2)?.total || 0)
  let trendNode = <>{stats.unpaid_count} ödenmemiş fatura</>
  if (prev > 0) {
    const pct = Math.round(((cur - prev) / prev) * 100)
    const up = pct >= 0
    trendNode = (
      <span className="inline-flex items-center gap-1">
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        geçen aya göre %{Math.abs(pct)}
      </span>
    )
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-semibold text-bark-900">Gösterge Paneli</h1>

      {/* 3 gradyanlı KPI kartı */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Toplam Gecikmiş Borç"
          value={formatCurrency(stats.total_overdue)}
          sub={`${stats.overdue_count} gecikmiş fatura`}
          icon={AlertTriangle}
          from="#C96F4A"
          to="#A03A28"
        />
        <KpiCard
          label="Gelecek 7 Gün Yükü"
          value={formatCurrency(stats.due_next_7_days)}
          sub="yaklaşan ödemeler"
          icon={CalendarClock}
          from="#D8A75A"
          to="#BE7B33"
        />
        <KpiCard
          label="Bu Ayın Harcaması"
          value={formatCurrency(stats.this_month_total)}
          sub={trendNode}
          icon={Wallet}
          from="#869A5F"
          to="#566B3A"
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Donut: kategori dağılımı + yüzdeli açıklama */}
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 lg:col-span-2">
          <h2 className="mb-2 font-medium text-bark-800">Kategori Dağılımı</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={104}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Merkez toplam */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-bark-400">Toplam</span>
              <span className="font-serif text-lg font-semibold text-bark-900">{formatCurrency(totalCat)}</span>
            </div>
          </div>
          {/* Yüzdeli açıklama (legend) */}
          <div className="mt-4 space-y-2">
            {pieData.map((d, i) => {
              const pct = totalCat ? Math.round((d.value / totalCat) * 100) : 0
              return (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-bark-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.name}
                  </span>
                  <span className="text-bark-500">{formatCurrency(d.value)} · %{pct}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alan grafiği: 6 aylık trend (dolgulu çizgi) */}
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 lg:col-span-3">
          <h2 className="mb-4 font-medium text-bark-800">Son 6 Ay Ödeme Trendi</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={lineData} margin={{ left: -6, right: 12, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C2703F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C2703F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECE3D2" vertical={false} />
              <XAxis dataKey="name" stroke="#9A8B78" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#9A8B78"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#C2703F"
                strokeWidth={2.5}
                fill="url(#trendFill)"
                dot={{ fill: '#C2703F', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
