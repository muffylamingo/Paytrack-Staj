import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { getStats } from '../api/stats'
import { formatCurrency } from '../lib/format'
import { useLang } from '../context/LanguageContext'

// Otomatik Hatırlatıcı: son ödeme tarihi BUGÜN olan (ödenmemiş) faturalar için uyarı bandı.
export default function ReminderBanner() {
  const [items, setItems] = useState([])
  const [closed, setClosed] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    getStats()
      .then((s) => setItems(s.due_today || []))
      .catch(() => {})
  }, [])

  if (closed || items.length === 0) return null

  const total = items.reduce((sum, i) => sum + Number(i.amount), 0)
  const vendors = items.map((i) => i.vendor_name).join(', ')

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-clay-300 bg-pending-bg px-4 py-3 text-pending-tx">
      <Bell size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm">
        <span className="font-semibold">{t('reminder.title', { count: items.length })}</span>
        {' — '}
        {vendors} · {t('reminder.total')} <b>{formatCurrency(total)}</b>
      </p>
      <button
        onClick={() => setClosed(true)}
        className="shrink-0 rounded-lg p-1 transition hover:bg-clay-300/50"
        title={t('common.close')}
      >
        <X size={16} />
      </button>
    </div>
  )
}
