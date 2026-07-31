import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, CalendarClock, Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getStats } from '../api/stats'
import { getBudgets } from '../api/budgets'
import { formatCurrency } from '../lib/format'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import BudgetBar from '../components/BudgetBar'

/*
  Grafik renkleri neden burada (CSS'te değil)?
  Recharts renkleri JS prop'u olarak alıyor (fill="#C2703F"), CSS sınıfı değil.
  Bu yüzden iki paleti burada tanımlayıp temaya göre seçiyoruz.
  Koyu temada renkler biraz AÇILDI (koyu zeminde soluk renkler kaybolur).
*/
const CHART = {
  light: {
    pie:  ['#C2703F', '#7A8B5A', '#6B5D4B', '#D08B5E', '#A6402C', '#9A8B78'],
    line: '#C2703F',
    grid: '#ECE3D2',
    axis: '#9A8B78',
    tooltip: { bg: '#FBF8F1', border: '#DFD3BC', text: '#2C2418' },
    // 3 KPI kartının gradyanları [başlangıç, bitiş]
    kpi: [['#C96F4A', '#A03A28'], ['#D8A75A', '#BE7B33'], ['#869A5F', '#566B3A']],
  },
  dark: {
    pie:  ['#E08A54', '#9DB47A', '#B3A491', '#F0B183', '#E0705A', '#7E7263'],
    line: '#E09E6B',
    grid: '#3D3225',
    axis: '#A2937E',
    tooltip: { bg: '#2E251B', border: '#3D3225', text: '#F5EDE0' },
    // Koyu temada gradyanlar derinleştirildi ki beyaz yazı okunsun
    kpi: [['#9A4732', '#5E2419'], ['#93662A', '#5C3D16'], ['#54683A', '#2F3D1D']],
  },
}

// "2026-07" -> "Tem" (tr) / "Jul" (en) — ay adları da sözlükten geliyor
function monthLabel(key, months) {
  const m = Number(key.split('-')[1])
  return months[m - 1] || key
}

// Gradyanlı, ikonlu KPI kartı (Purple template tarzı, organic renklerde)
// NOT: yazı rengi "white" — cream-50 kullanamayız, çünkü koyu temada o renk
// koyulaşır ve yazı gradyanın üstünde kaybolurdu.
function KpiCard({ label, value, sub, icon: Icon, from, to }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {/* dekoratif baloncuklar */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 right-10 h-20 w-20 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
        <p className="text-sm font-medium text-white/90">{label}</p>
        <div className="rounded-xl bg-white/20 p-2">
          <Icon size={20} />
        </div>
      </div>
      <p className="relative mt-3 font-serif text-3xl font-semibold">{value}</p>
      {sub && <p className="relative mt-3 text-xs text-white/85">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [error, setError] = useState(false)
  const { isDark } = useTheme()
  const { t } = useLang()
  const c = isDark ? CHART.dark : CHART.light   // aktif grafik paleti

  useEffect(() => {
    getStats().then(setStats).catch(() => setError(true))
    // Bütçeler ayrı bir istek: gelmezse panel yine çalışsın (kritik veri değil)
    getBudgets().then(setBudgets).catch(() => {})
  }, [])

  if (error) return <p className="text-overdue-tx">{t('dashboard.statsError')}</p>
  if (!stats) return <p className="text-bark-400">{t('common.loading')}</p>

  // Kategori adları grafikte de çevrili görünsün
  const pieData = stats.by_category.map((x) => ({ name: t(`category.${x.category}`), value: Number(x.total) }))
  const lineData = stats.monthly_trend.map((m) => ({ name: monthLabel(m.month, t('months')), total: Number(m.total) }))
  const totalCat = pieData.reduce((s, d) => s + d.value, 0)

  // Recharts tooltip'i tema renklerinde
  const tooltipProps = {
    contentStyle: {
      background: c.tooltip.bg,
      border: `1px solid ${c.tooltip.border}`,
      borderRadius: 12,
      color: c.tooltip.text,
    },
    itemStyle: { color: c.tooltip.text },
    labelStyle: { color: c.tooltip.text },
    cursor: { fill: c.grid, fillOpacity: 0.35 },
  }

  // "Bu Ay" için geçen aya göre değişim (KPI trend oku)
  const cur = Number(stats.monthly_trend.at(-1)?.total || 0)
  const prev = Number(stats.monthly_trend.at(-2)?.total || 0)
  let trendNode = <>{t('dashboard.unpaidSub', { count: stats.unpaid_count })}</>
  if (prev > 0) {
    const pct = Math.round(((cur - prev) / prev) * 100)
    const up = pct >= 0
    trendNode = (
      <span className="inline-flex items-center gap-1">
        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {t('dashboard.trend', { percent: Math.abs(pct) })}
      </span>
    )
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl font-semibold text-bark-900">{t('dashboard.title')}</h1>

      {/* 3 gradyanlı KPI kartı */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label={t('dashboard.overdue')}
          value={formatCurrency(stats.total_overdue)}
          sub={t('dashboard.overdueSub', { count: stats.overdue_count })}
          icon={AlertTriangle}
          from={c.kpi[0][0]}
          to={c.kpi[0][1]}
        />
        <KpiCard
          label={t('dashboard.next7')}
          value={formatCurrency(stats.due_next_7_days)}
          sub={t('dashboard.next7Sub')}
          icon={CalendarClock}
          from={c.kpi[1][0]}
          to={c.kpi[1][1]}
        />
        <KpiCard
          label={t('dashboard.thisMonth')}
          value={formatCurrency(stats.this_month_total)}
          sub={trendNode}
          icon={Wallet}
          from={c.kpi[2][0]}
          to={c.kpi[2][1]}
        />
      </div>

      {/* Bütçe durumu — sadece bütçe tanımlıysa görünür */}
      {budgets.length > 0 && (
        <div className="mb-6 rounded-2xl border border-cream-300 bg-cream-50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-bark-800">{t('dashboard.budgetStatus')}</h2>
            <Link to="/raporlar" className="text-xs font-medium text-clay-600 hover:underline">
              {t('dashboard.editBudgets')}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => (
              <BudgetBar key={b.category} budget={b} />
            ))}
          </div>
        </div>
      )}

      {/* Grafikler */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Donut: kategori dağılımı + yüzdeli açıklama */}
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 lg:col-span-2">
          <h2 className="mb-2 font-medium text-bark-800">{t('dashboard.byCategory')}</h2>
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
                  // Giriş animasyonu KAPALI: recharts 3 + React StrictMode ikilisinde
                  // animasyon bazen yarıda kalıyor ve dilimler hiç çizilmiyordu.
                  isAnimationActive={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={c.pie[i % c.pie.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} {...tooltipProps} />
              </PieChart>
            </ResponsiveContainer>
            {/* Merkez toplam */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-bark-400">{t('common.total')}</span>
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
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.pie[i % c.pie.length] }} />
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
          <h2 className="mb-4 font-medium text-bark-800">{t('dashboard.monthlyTrend')}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={lineData} margin={{ left: -6, right: 12, top: 10, bottom: 0 }}>
              <defs>
                {/* Dolgu gradyanı da temaya göre renk değiştiriyor */}
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.line} stopOpacity={isDark ? 0.45 : 0.35} />
                  <stop offset="100%" stopColor={c.line} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={c.grid} vertical={false} />
              <XAxis dataKey="name" stroke={c.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke={c.axis}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              />
              <Tooltip formatter={(v) => formatCurrency(v)} {...tooltipProps} />
              <Area
                type="monotone"
                dataKey="total"
                stroke={c.line}
                strokeWidth={2.5}
                fill="url(#trendFill)"
                dot={{ fill: c.line, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
