import { useEffect, useState } from 'react'
import { PlusCircle, PencilLine, Trash2, ShieldCheck, ArrowRight } from 'lucide-react'
import { getAuditLog } from '../api/audit'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'
import { formatDate } from '../lib/format'

const ENTITIES = ['invoice', 'budget', 'rate']
const ACTIONS = ['create', 'update', 'delete']

// İşlem türüne göre ikon + renk (tema değişkenlerinden geldiği için koyu modda uyumlu)
const ACTION_STYLE = {
  create: { Icon: PlusCircle, cls: 'bg-paid-bg text-paid-tx' },
  update: { Icon: PencilLine, cls: 'bg-pending-bg text-pending-tx' },
  delete: { Icon: Trash2, cls: 'bg-overdue-bg text-overdue-tx' },
}

// İşlem Geçmişi sayfası (Ekstra Özellik #10)
export default function History() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [entity, setEntity] = useState('')
  const [action, setAction] = useState('')
  const toast = useToast()
  const { t, locale } = useLang()

  useEffect(() => {
    let iptal = false
    setLoading(true)
    const params = {}
    if (entity) params.entity = entity
    if (action) params.action = action
    getAuditLog(params)
      .then((d) => !iptal && setLogs(d))
      .catch(() => !iptal && toast.error(t('toast.dataLoadFailed')))
      .finally(() => !iptal && setLoading(false))
    // Temizlik: filtre hızlı değişirse eski isteğin cevabı yeniyi ezmesin
    return () => { iptal = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, action])

  // "2026-07-31T05:07:43Z" -> "31 Temmuz 2026 08:07"
  const zaman = (iso) =>
    new Date(iso).toLocaleString(locale, {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

  /*
    Log'daki değerler veritabanından METİN olarak geliyor ("2500.00",
    "2026-07-31T05:07:43+00:00", "Bekliyor"). Kullanıcıya ham hâliyle
    göstermek çirkin olurdu; tipine göre biçimlendiriyoruz.
  */
  const PARA_ALANLARI = new Set(['amount', 'monthly_limit', 'rate'])
  const CEVRILEN_ALANLAR = { status: 'status', category: 'category', recurrence: 'recurrence' }

  function gosterilecek(field, value) {
    if (value == null || value === '') return t('history.empty_value')
    // Çevrilebilir değerler (Bekliyor -> Pending gibi)
    if (CEVRILEN_ALANLAR[field]) return t(`${CEVRILEN_ALANLAR[field]}.${value}`)
    // Tam tarih-saat
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return zaman(value)
    // Sadece tarih
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDate(value)
    // Para alanları: 2 ondalık + bölgesel ayıraç
    if (PARA_ALANLARI.has(field) && /^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return value
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-bark-900">{t('history.title')}</h1>
        <p className="flex items-center gap-1.5 text-sm text-bark-400">
          <ShieldCheck size={14} /> {t('history.subtitle')}
        </p>
      </div>

      {/* Filtreler */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={entity}
          onChange={(e) => setEntity(e.target.value)}
          className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-bark-800 outline-none focus:border-clay-400"
        >
          <option value="">{t('history.allEntities')}</option>
          {ENTITIES.map((x) => (
            <option key={x} value={x}>{t(`history.entity.${x}`)}</option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-bark-800 outline-none focus:border-clay-400"
        >
          <option value="">{t('history.allActions')}</option>
          {ACTIONS.map((x) => (
            <option key={x} value={x}>{t(`history.actionLabel.${x}`)}</option>
          ))}
        </select>
        <span className="text-sm text-bark-400">{t('history.count', { count: logs.length })}</span>
      </div>

      {loading ? (
        <p className="text-bark-400">{t('common.loading')}</p>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-10 text-center text-sm text-bark-400">
          {t('history.empty')}
        </div>
      ) : (
        <div className="rounded-2xl border border-cream-300 bg-cream-50">
          <ul className="divide-y divide-cream-200">
            {logs.map((log) => {
              const { Icon, cls } = ACTION_STYLE[log.action] ?? ACTION_STYLE.update
              return (
                <li key={log.id} className="flex gap-3 px-5 py-4">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
                    <Icon size={16} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-bark-800">
                      <span className="text-bark-400">{t(`history.entity.${log.entity}`)}</span>{' '}
                      {/* Bütçe kaydının etiketi bir kategori adı -> onu çevirebiliriz.
                          Fatura no ve para birimi ise çevrilmez (evrensel kodlar). */}
                      <b className="text-bark-900">
                        {log.entity === 'budget' ? t(`category.${log.entity_label}`) : log.entity_label}
                      </b>{' '}
                      {t(`history.action.${log.action}`)}
                    </p>

                    {/* Değişen alanlar: eski -> yeni */}
                    {log.changes.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {log.changes.map((c) => (
                          <li key={c.field} className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="rounded-md bg-cream-200 px-1.5 py-0.5 font-medium text-bark-600">
                              {t(`history.field.${c.field}`)}
                            </span>
                            <span className="text-bark-400 line-through">
                              {gosterilecek(c.field, c.old)}
                            </span>
                            <ArrowRight size={11} className="text-bark-400" />
                            <span className="font-medium text-bark-800">
                              {gosterilecek(c.field, c.new)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="mt-1.5 text-xs text-bark-400">
                      {zaman(log.created_at)} · {log.username || t('history.system')}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
