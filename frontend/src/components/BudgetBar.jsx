import { formatCurrency } from '../lib/format'
import { useLang } from '../context/LanguageContext'

/*
  Tek bir kategorinin bütçe doluluk çubuğu.
  Hem Gösterge Paneli'nde hem Raporlar'da kullanılıyor (tek yerde yaz, iki yerde kullan).

  Renkler tema değişkenlerinden geldiği için karanlık modda otomatik uyumlu.
*/

// Durum -> renk sınıfları (backend "İyi" / "Uyarı" / "Aşıldı" gönderiyor)
const TONE = {
  'İyi':    { bar: 'bg-sage-500',      text: 'text-paid-tx',    chip: 'bg-paid-bg text-paid-tx' },
  'Uyarı':  { bar: 'bg-clay-400',      text: 'text-pending-tx', chip: 'bg-pending-bg text-pending-tx' },
  'Aşıldı': { bar: 'bg-overdue-tx',    text: 'text-overdue-tx', chip: 'bg-overdue-bg text-overdue-tx' },
}

export default function BudgetBar({ budget, showRemaining = true }) {
  const { t } = useLang()
  const tone = TONE[budget.state] ?? TONE['İyi']
  // Çubuk %100'ü geçemez (görsel olarak taşmasın) ama yüzdeyi gerçek değeriyle yazıyoruz
  const width = Math.min(budget.percent, 100)

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium text-bark-800">
          {t(`category.${budget.category}`)}
          {budget.state !== 'İyi' && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tone.chip}`}>
              {budget.state === 'Aşıldı' ? t('budget.over') : t('budget.near')}
            </span>
          )}
        </span>
        <span className={`text-xs font-medium ${tone.text}`}>%{budget.percent}</span>
      </div>

      {/* Çubuk: gri zemin + renkli dolgu */}
      <div className="h-2 overflow-hidden rounded-full bg-cream-200">
        <div
          // SADECE width animasyonlanıyor. "transition-all" KULLANMA: rengi de
          // animasyona sokuyor ve tema değişince (renk bir CSS değişkeninden
          // geldiği için) tarayıcı eski renkte takılı kalıyor.
          className={`h-full rounded-full transition-[width] duration-500 ${tone.bar}`}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-1 flex justify-between text-xs text-bark-400">
        <span>
          {formatCurrency(budget.spent, budget.currency)} / {formatCurrency(budget.monthly_limit, budget.currency)}
        </span>
        {showRemaining && (
          <span className={Number(budget.remaining) < 0 ? tone.text : ''}>
            {Number(budget.remaining) < 0
              ? t('budget.overBy', { amount: formatCurrency(Math.abs(budget.remaining), budget.currency) })
              : t('budget.left', { amount: formatCurrency(budget.remaining, budget.currency) })}
          </span>
        )}
      </div>
    </div>
  )
}
