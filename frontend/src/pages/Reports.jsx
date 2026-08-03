import { useEffect, useState } from 'react'
import { Wallet, Trash2, Check, ArrowLeftRight } from 'lucide-react'
import { getBudgets, setBudget, deleteBudget } from '../api/budgets'
import { getRates, setRate } from '../api/rates'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'
import BudgetBar from '../components/BudgetBar'
import { yonetebilirMi } from '../auth/keycloak'

const CATEGORIES = ['Enerji', 'Yazılım', 'Kira', 'Mutfak']

// Raporlar sayfası: kategori bazlı aylık bütçe yönetimi (Ekstra Özellik #6)
export default function Reports() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState({})   // kategori -> input'a yazılan değer
  const [savingCat, setSavingCat] = useState(null)
  const [rates, setRates] = useState([])
  const [rateDrafts, setRateDrafts] = useState({})
  const toast = useToast()
  const { t, locale } = useLang()
  const yonetebilir = yonetebilirMi()   // bütçe/kur değiştirmek müdür yetkisi

  async function load() {
    setLoading(true)
    try {
      // İki isteği PARALEL at (Promise.all) — sırayla beklemek gereksiz yavaşlık olurdu
      const [budgetData, rateData] = await Promise.all([getBudgets(), getRates()])
      setBudgets(budgetData)
      setRates(rateData)
      // Var olan limitleri input'lara doldur
      setDrafts(Object.fromEntries(budgetData.map((b) => [b.category, String(Number(b.monthly_limit))])))
      setRateDrafts(Object.fromEntries(rateData.map((r) => [r.currency, String(Number(r.rate))])))
    } catch {
      toast.error(t('toast.dataLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveRate(currency) {
    const value = rateDrafts[currency]
    if (!value || Number(value) <= 0) {
      toast.error(t('toast.ratePositive'))
      return
    }
    try {
      await setRate(currency, value)
      toast.success(t('toast.rateSaved', { currency, rate: Number(value).toLocaleString(locale) }))
      load()
    } catch {
      toast.error(t('toast.rateSaveFailed'))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(category) {
    const value = drafts[category]
    if (!value || Number(value) <= 0) {
      toast.error(t('toast.limitPositive'))
      return
    }
    setSavingCat(category)
    try {
      await setBudget(category, value)
      toast.success(t('toast.budgetSaved', { category: t(`category.${category}`) }))
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail?.[0]?.msg || t('toast.budgetSaveFailed'))
    } finally {
      setSavingCat(null)
    }
  }

  async function handleDelete(category) {
    try {
      await deleteBudget(category)
      toast.success(t('toast.budgetRemoved', { category: t(`category.${category}`) }))
      load()
    } catch {
      toast.error(t('toast.budgetRemoveFailed'))
    }
  }

  const byCategory = Object.fromEntries(budgets.map((b) => [b.category, b]))
  const asilan = budgets.filter((b) => b.state === 'Aşıldı')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-bark-900">{t('reports.title')}</h1>
        <p className="text-sm text-bark-400">{t('reports.subtitle')}</p>
      </div>

      {/* Aşım varsa tepede toplu uyarı */}
      {asilan.length > 0 && (
        <div className="mb-6 rounded-2xl border border-overdue-tx/25 bg-overdue-bg px-4 py-3 text-sm text-overdue-tx">
          ⚠️ <b>{t('reports.overBudgetBanner', { count: asilan.length })}</b>{' '}
          {asilan.map((b) => `${t(`category.${b.category}`)} (%${b.percent})`).join(' · ')}
        </div>
      )}

      {!yonetebilir && (
        <div className="mb-4 rounded-2xl border border-cream-300 bg-cream-100 px-4 py-2.5 text-sm text-bark-600">
          👁️ {t('common.readOnly')}
        </div>
      )}

      {loading ? (
        <p className="text-bark-400">{t('common.loading')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* SOL: Bütçe belirleme */}
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5">
            <h2 className="mb-4 flex items-center gap-2 font-medium text-bark-800">
              <Wallet size={18} /> {t('reports.budgetLimits')}
            </h2>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const mevcut = byCategory[cat]
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-sm text-bark-700">{t(`category.${cat}`)}</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder={t('reports.noLimit')}
                        value={drafts[cat] ?? ''}
                        onChange={(e) => setDrafts({ ...drafts, [cat]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(cat)}
                        disabled={!yonetebilir}
                        className="w-full rounded-xl border border-cream-300 bg-cream-100 py-2 pl-3 pr-8 text-sm text-bark-900 outline-none focus:border-clay-400"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-bark-400">₺</span>
                    </div>
                    <button
                      onClick={() => handleSave(cat)}
                      disabled={savingCat === cat || !yonetebilir}
                      title={t('common.save')}
                      className="rounded-lg bg-clay-500 p-2 text-cream-50 transition hover:bg-clay-600 disabled:opacity-60"
                    >
                      <Check size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={!mevcut || !yonetebilir}
                      title={mevcut ? t('reports.removeBudget') : t('reports.noBudgetForCategory')}
                      className="rounded-lg p-2 text-bark-400 transition hover:bg-overdue-bg hover:text-overdue-tx disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-bark-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs text-bark-400">
              {t('reports.budgetHint')}
            </p>

            {/* --- Döviz kurları (Ekstra #8) --- */}
            <div className="mt-5 border-t border-cream-300 pt-5">
              <h2 className="mb-3 flex items-center gap-2 font-medium text-bark-800">
                <ArrowLeftRight size={18} /> {t('reports.rates')}
              </h2>
              <div className="space-y-3">
                {rates.map((r) => (
                  <div key={r.currency} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-sm text-bark-700">1 {r.currency}</span>
                    <span className="text-sm text-bark-400">=</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0.0001"
                        step="0.0001"
                        value={rateDrafts[r.currency] ?? ''}
                        onChange={(e) => setRateDrafts({ ...rateDrafts, [r.currency]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRate(r.currency)}
                        disabled={!yonetebilir}
                        className="w-full rounded-xl border border-cream-300 bg-cream-100 py-2 pl-3 pr-8 text-sm text-bark-900 outline-none focus:border-clay-400"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-bark-400">₺</span>
                    </div>
                    {r.is_default && (
                      <span className="shrink-0 rounded-full bg-pending-bg px-2 py-0.5 text-[10px] font-medium text-pending-tx">
                        {t('reports.rateDefault')}
                      </span>
                    )}
                    <button
                      onClick={() => handleSaveRate(r.currency)}
                      disabled={!yonetebilir}
                      title={t('reports.saveRate')}
                      className="rounded-lg bg-clay-500 p-2 text-cream-50 transition hover:bg-clay-600"
                    >
                      <Check size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-bark-400">
                {t('reports.rateHint')}
              </p>
            </div>
          </div>

          {/* SAĞ: Doluluk durumu */}
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5">
            <h2 className="mb-4 font-medium text-bark-800">{t('reports.fillThisMonth')}</h2>
            {budgets.length === 0 ? (
              <p className="text-sm text-bark-400">
                {t('reports.noBudgets')}
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
