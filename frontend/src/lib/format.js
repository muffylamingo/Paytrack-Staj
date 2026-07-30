// Görüntüleme yardımcıları (para, tarih, durum renkleri)

const CURRENCY_SYMBOL = { TRY: '₺', USD: '$', EUR: '€' }

// 4200.5 -> "4.200,50 ₺"
export function formatCurrency(amount, currency = 'TRY') {
  const n = Number(amount)
  const formatted = n.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sym = CURRENCY_SYMBOL[currency] || currency
  return `${formatted} ${sym}`
}

// "2026-08-05" -> "05 Ağu 2026"
export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Son ödeme tarihine kaç gün kaldı? (geçmişse negatif)
export function daysUntil(dateStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dateStr)
  due.setHours(0, 0, 0, 0)
  return Math.round((due - today) / (1000 * 60 * 60 * 24))
}

// Ödenmemiş VE son ödeme 7 günden yakın/geçmiş mi? (PDF: yaklaşan = kırmızı)
export function isNearDue(invoice) {
  if (invoice.status === 'Ödendi') return false
  return daysUntil(invoice.due_date) <= 7
}

// Durum rozetinin renk sınıfları (organic palet)
export function statusBadge(status) {
  switch (status) {
    case 'Ödendi':
      return 'bg-paid-bg text-paid-tx'
    case 'Gecikti':
      return 'bg-overdue-bg text-overdue-tx'
    default: // Bekliyor
      return 'bg-pending-bg text-pending-tx'
  }
}
