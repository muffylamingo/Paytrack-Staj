import { useEffect, useState } from 'react'
import { Wallet, Trash2, Check } from 'lucide-react'
import { getBudgets, setBudget, deleteBudget } from '../api/budgets'
import { useToast } from '../context/ToastContext'
import BudgetBar from '../components/BudgetBar'

const CATEGORIES = ['Enerji', 'Yazılım', 'Kira', 'Mutfak']

// Raporlar sayfası: kategori bazlı aylık bütçe yönetimi (Ekstra Özellik #6)
export default function Reports() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState({})   // kategori -> input'a yazılan değer
  const [savingCat, setSavingCat] = useState(null)
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const data = await getBudgets()
      setBudgets(data)
      // Var olan limitleri input'lara doldur
      setDrafts(Object.fromEntries(data.map((b) => [b.category, String(Number(b.monthly_limit))])))
    } catch {
      toast.error('Bütçeler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(category) {
    const value = drafts[category]
    if (!value || Number(value) <= 0) {
      toast.error("Limit 0'dan büyük olmalı")
      return
    }
    setSavingCat(category)
    try {
      await setBudget(category, value)
      toast.success(`${category} bütçesi kaydedildi`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail?.[0]?.msg || 'Bütçe kaydedilemedi')
    } finally {
      setSavingCat(null)
    }
  }

  async function handleDelete(category) {
    try {
      await deleteBudget(category)
      toast.success(`${category} bütçesi kaldırıldı`)
      load()
    } catch {
      toast.error('Bütçe kaldırılamadı')
    }
  }

  const byCategory = Object.fromEntries(budgets.map((b) => [b.category, b]))
  const asilan = budgets.filter((b) => b.state === 'Aşıldı')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-bark-900">Raporlar</h1>
        <p className="text-sm text-bark-400">Kategori bazlı aylık bütçeler ve doluluk durumu</p>
      </div>

      {/* Aşım varsa tepede toplu uyarı */}
      {asilan.length > 0 && (
        <div className="mb-6 rounded-2xl border border-overdue-tx/25 bg-overdue-bg px-4 py-3 text-sm text-overdue-tx">
          ⚠️ <b>{asilan.length} kategoride bütçe aşıldı:</b>{' '}
          {asilan.map((b) => `${b.category} (%${b.percent})`).join(' · ')}
        </div>
      )}

      {loading ? (
        <p className="text-bark-400">Yükleniyor…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* SOL: Bütçe belirleme */}
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-medium text-bark-800">
              <Wallet size={18} /> Aylık Bütçe Limitleri
            </h2>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const mevcut = byCategory[cat]
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-sm text-bark-700">{cat}</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Limit yok"
                        value={drafts[cat] ?? ''}
                        onChange={(e) => setDrafts({ ...drafts, [cat]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(cat)}
                        className="w-full rounded-xl border border-cream-300 bg-cream-100 py-2 pl-3 pr-8 text-sm text-bark-900 outline-none focus:border-clay-400"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-bark-400">₺</span>
                    </div>
                    <button
                      onClick={() => handleSave(cat)}
                      disabled={savingCat === cat}
                      title="Kaydet"
                      className="rounded-lg bg-clay-500 p-2 text-cream-50 transition hover:bg-clay-600 disabled:opacity-60"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={!mevcut}
                      title={mevcut ? 'Bütçeyi kaldır' : 'Bu kategoride bütçe yok'}
                      className="rounded-lg p-2 text-bark-400 transition hover:bg-overdue-bg hover:text-overdue-tx disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-bark-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-bark-400">
              💡 Harcama, <b>son ödeme tarihi bu ay olan</b> faturalar üzerinden hesaplanır —
              gösterge panelindeki “Bu Ayın Harcaması” ile aynı kural.
            </p>
          </div>

          {/* SAĞ: Doluluk durumu */}
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5">
            <h2 className="mb-4 font-medium text-bark-800">Bu Ayki Doluluk</h2>
            {budgets.length === 0 ? (
              <p className="text-sm text-bark-400">
                Henüz bütçe belirlenmedi. Soldan bir limit girip kaydet. 🌱
              </p>
            ) : (
              <div className="space-y-5">
                {budgets.map((b) => (
                  <BudgetBar key={b.category} budget={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
