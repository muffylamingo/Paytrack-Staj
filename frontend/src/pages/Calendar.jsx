import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { getInvoices } from '../api/invoices'
import { formatCurrency, formatDate } from '../lib/format'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'

/*
  Ödeme Takvimi (Ekstra Özellik #11)

  Yeni bir tablo veya endpoint GEREKMEDİ — mevcut GET /invoices verisini
  son ödeme tarihine göre gruplayıp takvim ızgarasında gösteriyoruz.
  "Aynı veri, farklı görünüm" — bir veriyi listeden başka biçimlerde de
  sunabilmek arayüz tasarımının önemli bir parçası.
*/

// Faturanın takvimdeki rengi (durumuna göre) — tema değişkenleri sayesinde koyu modda da uyumlu
function tone(inv, today) {
  if (inv.status === 'Ödendi') return 'bg-paid-bg text-paid-tx'
  if (inv.due_date < today) return 'bg-overdue-bg text-overdue-tx'   // ödenmemiş + tarihi geçmiş
  return 'bg-pending-bg text-pending-tx'
}

// "2026-08-05" biçiminde yerel tarih anahtarı (toISOString saat dilimi kaydırır, kullanmıyoruz!)
function dateKey(d) {
  const ay = String(d.getMonth() + 1).padStart(2, '0')
  const gun = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${ay}-${gun}`
}

export default function Calendar() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState(() => new Date())   // gösterilen ay
  const [selected, setSelected] = useState(null)           // tıklanan gün
  const toast = useToast()
  const { t, locale } = useLang()

  const today = dateKey(new Date())

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch(() => toast.error(t('toast.loadFailed')))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Faturaları son ödeme tarihine göre grupla: { "2026-08-15": [fatura, ...] }
  const byDate = useMemo(() => {
    const map = {}
    for (const inv of invoices) {
      ;(map[inv.due_date] ||= []).push(inv)
    }
    return map
  }, [invoices])

  // Gün adları (Pzt..Paz) — sözlüğe yazmak yerine Intl'den üretiyoruz.
  // 1 Ocak 2024 bir PAZARTESİ, o yüzden oradan başlıyoruz.
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'short' }),
      ),
    [locale],
  )

  // Ayın ızgarasını kur: baştaki boşluklar + günler (hafta PAZARTESİ başlar)
  const { cells, monthKeys } = useMemo(() => {
    const yil = cursor.getFullYear()
    const ay = cursor.getMonth()
    const ilkGun = new Date(yil, ay, 1)
    const gunSayisi = new Date(yil, ay + 1, 0).getDate()
    // getDay(): 0=Pazar ... 6=Cumartesi -> Pazartesi'yi 0 yapmak için kaydır
    const bosluk = (ilkGun.getDay() + 6) % 7

    const list = Array.from({ length: bosluk }, () => null)
    const keys = []
    for (let g = 1; g <= gunSayisi; g++) {
      const d = new Date(yil, ay, g)
      const key = dateKey(d)
      keys.push(key)
      list.push({ day: g, key })
    }
    return { cells: list, monthKeys: keys }
  }, [cursor])

  // Bu ayın toplamı (TL karşılıklarıyla) ve fatura sayısı
  const { monthTotal, monthCount } = useMemo(() => {
    let toplam = 0
    let adet = 0
    for (const key of monthKeys) {
      for (const inv of byDate[key] || []) {
        toplam += Number(inv.amount_try ?? inv.amount)
        adet += 1
      }
    }
    return { monthTotal: toplam, monthCount: adet }
  }, [monthKeys, byDate])

  const ayBasligi = cursor.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const kaydir = (fark) => {
    setSelected(null)
    // DİKKAT: setCursor(new Date(cursor...)) YAZMA!
    // React durum güncellemelerini toplu işler; hızlıca iki kez tıklarsan iki
    // çağrı da AYNI eski `cursor` değerini okur ve takvim tek ay kayar.
    // Fonksiyon biçimi (c => ...) her zaman EN GÜNCEL değeri alır.
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + fark, 1))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-bark-900">{t('calendar.title')}</h1>
        <p className="flex items-center gap-1.5 text-sm text-bark-400">
          <CalendarDays size={14} /> {t('calendar.subtitle')}
        </p>
      </div>

      {/* Ay gezinme çubuğu */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => kaydir(-1)}
            title={t('calendar.prevMonth')}
            className="rounded-xl border border-cream-300 bg-cream-50 p-2 text-bark-600 transition hover:bg-cream-200"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[170px] text-center font-serif text-xl font-semibold capitalize text-bark-900">
            {ayBasligi}
          </span>
          <button
            onClick={() => kaydir(1)}
            title={t('calendar.nextMonth')}
            className="rounded-xl border border-cream-300 bg-cream-50 p-2 text-bark-600 transition hover:bg-cream-200"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => { setCursor(new Date()); setSelected(null) }}
            className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm font-medium text-bark-700 transition hover:bg-cream-200"
          >
            {t('calendar.today')}
          </button>
        </div>

        <div className="text-sm text-bark-400">
          {t('calendar.monthTotal')}:{' '}
          <b className="text-bark-900">{formatCurrency(monthTotal)}</b>{' '}
          <span className="text-bark-400">· {t('calendar.invoiceCount', { count: monthCount })}</span>
        </div>
      </div>

      {loading ? (
        <p className="text-bark-400">{t('common.loading')}</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-50">
            {/* Gün adları */}
            <div className="grid grid-cols-7 border-b border-cream-300 bg-cream-100">
              {weekdays.map((g) => (
                <div key={g} className="px-2 py-2 text-center text-xs font-medium uppercase text-bark-400">
                  {g}
                </div>
              ))}
            </div>

            {/* Günler */}
            <div className="grid grid-cols-7">
              {cells.map((cell, i) => {
                if (!cell) return <div key={`bos-${i}`} className="min-h-[104px] border-b border-r border-cream-200 bg-cream-100/40" />

                const gunFaturalari = byDate[cell.key] || []
                const bugunMu = cell.key === today
                const secili = selected === cell.key

                return (
                  <div
                    key={cell.key}
                    onClick={() => setSelected(secili ? null : cell.key)}
                    className={`min-h-[104px] cursor-pointer border-b border-r border-cream-200 p-1.5 transition hover:bg-cream-100 ${
                      secili ? 'bg-cream-200' : ''
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          bugunMu ? 'bg-clay-500 text-cream-50' : 'text-bark-600'
                        }`}
                      >
                        {cell.day}
                      </span>
                      {gunFaturalari.length > 0 && (
                        <span className="text-[10px] font-medium text-bark-400">{gunFaturalari.length}</span>
                      )}
                    </div>

                    {/* Gün içindeki faturalar (en fazla 2 tanesi, gerisi "+N daha") */}
                    <div className="space-y-1">
                      {gunFaturalari.slice(0, 2).map((inv) => (
                        <div
                          key={inv.id}
                          title={`${inv.vendor_name} · ${formatCurrency(inv.amount, inv.currency)}`}
                          className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium ${tone(inv, today)}`}
                        >
                          {inv.vendor_name}
                        </div>
                      ))}
                      {gunFaturalari.length > 2 && (
                        <div className="px-1.5 text-[10px] text-bark-400">
                          {t('calendar.more', { count: gunFaturalari.length - 2 })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {monthCount === 0 && (
            <p className="mt-4 text-center text-sm text-bark-400">{t('calendar.emptyMonth')}</p>
          )}

          {/* Seçilen günün detayı */}
          {selected && (byDate[selected]?.length ?? 0) > 0 && (
            <div className="mt-4 rounded-2xl border border-cream-300 bg-cream-50 p-5">
              <h2 className="mb-3 font-medium text-bark-800">
                {t('calendar.dayTitle', { date: formatDate(selected), count: byDate[selected].length })}
              </h2>
              <ul className="divide-y divide-cream-200">
                {byDate[selected].map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      <b className="text-bark-900">{inv.vendor_name}</b>{' '}
                      <span className="text-bark-400">· {inv.invoice_number}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-bark-900">{formatCurrency(inv.amount, inv.currency)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone(inv, today)}`}>
                        {t(`status.${inv.status}`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
