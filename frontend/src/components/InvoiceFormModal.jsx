import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { createInvoice, updateInvoice } from '../api/invoices'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'

const CATEGORIES = ['Enerji', 'Yazılım', 'Kira', 'Mutfak']
const CURRENCIES = ['TRY', 'USD', 'EUR']
const RECURRENCES = ['Aylık', '3 Aylık', 'Yıllık']

const EMPTY = {
  invoice_number: '',
  vendor_name: '',
  category: 'Enerji',
  amount: '',
  currency: 'TRY',
  due_date: '',
  notes: '',
  recurrence: '',   // boş = tek seferlik fatura
}

const inputCls =
  'w-full rounded-xl border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-bark-900 outline-none focus:border-clay-400'

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-bark-600">{label}</span>
      {children}
    </label>
  )
}

/*
  Sağdan açılan fatura formu (slide-over).

  TEK BİLEŞEN, İKİ İŞ: `invoice` prop'u
    - BOŞSA  -> yeni kayıt oluşturur (POST)
    - DOLUYSA -> mevcut kaydı günceller (PUT)
  Ayrı bir "düzenleme formu" yazmak yerine aynı formu kullanıyoruz; alanlar
  zaten birebir aynı. İki dosyayı senkron tutma derdi de olmuyor.
*/
export default function InvoiceFormModal({ open, onClose, onSaved, invoice = null }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const { t } = useLang()

  const duzenleme = Boolean(invoice)   // düzenleme modunda mıyız?

  // Form açıldığında alanları doldur:
  //   düzenleme -> mevcut faturanın değerleri
  //   yeni      -> boş form
  // (Bileşen kapalıyken de bellekte kalıyor; bu yüzden her açılışta sıfırlıyoruz.)
  useEffect(() => {
    if (!open) return
    if (invoice) {
      setForm({
        invoice_number: invoice.invoice_number ?? '',
        vendor_name: invoice.vendor_name ?? '',
        category: invoice.category ?? 'Enerji',
        amount: String(invoice.amount ?? ''),
        currency: invoice.currency ?? 'TRY',
        due_date: invoice.due_date ?? '',
        notes: invoice.notes ?? '',
        recurrence: invoice.recurrence ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [open, invoice])

  if (!open) return null

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const gonderilecek = {
        ...form,
        amount: Number(form.amount),
        // Boş metin yerine null gönder — backend "tekrarlamaz" diye anlasın
        // (boş string geçerli bir Recurrence değeri değil, 422 hatası verirdi)
        recurrence: form.recurrence || null,
      }

      if (duzenleme) {
        await updateInvoice(invoice.id, gonderilecek)
        toast.success(t('toast.invoiceUpdated', { vendor: form.vendor_name }))
      } else {
        await createInvoice(gonderilecek)
        toast.success(t('toast.invoiceSaved', { vendor: form.vendor_name }))
        setForm(EMPTY)
      }

      onSaved()   // listeyi yenile
      onClose()
    } catch {
      // Hem form içinde hem toast olarak göster (kullanıcı ikisini de kaçırmasın)
      setError(t('form.error'))
      toast.error(t('toast.invoiceSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    // Arka plan karartma — tıklanınca kapanır
    // (bark-900 KULLANMIYORUZ: koyu temada o renk krem olur, karartma beyazlaşırdı)
    <div className="fixed inset-0 z-50 flex justify-end bg-overlay/50" onClick={onClose}>
      {/* Panel — içine tıklama kapatmasın */}
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-cream-50 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-bark-900">
            {duzenleme ? t('form.editTitle') : t('form.title')}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-bark-400 hover:bg-cream-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label={t('form.number')}>
            <input required value={form.invoice_number} onChange={set('invoice_number')} className={inputCls} />
          </Field>
          <Field label={t('form.vendor')}>
            <input required value={form.vendor_name} onChange={set('vendor_name')} className={inputCls} />
          </Field>
          <Field label={t('form.category')}>
            {/* value HER ZAMAN Türkçe (veritabanı değeri); sadece etiketi çeviriyoruz */}
            <select value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`category.${c}`)}</option>
              ))}
            </select>
          </Field>
          <div className="flex gap-3">
            <Field label={t('form.amount')} className="flex-1">
              <input required type="number" step="0.01" min="0" value={form.amount} onChange={set('amount')} className={inputCls} />
            </Field>
            <Field label={t('form.currency')}>
              <select value={form.currency} onChange={set('currency')} className={inputCls}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label={t('form.dueDate')}>
            <input required type="date" value={form.due_date} onChange={set('due_date')} className={inputCls} />
          </Field>
          <Field label={t('form.recurrence')}>
            <select value={form.recurrence} onChange={set('recurrence')} className={inputCls}>
              <option value="">{t('recurrence.none')}</option>
              {RECURRENCES.map((r) => (
                <option key={r} value={r}>{t('recurrence.option', { value: t(`recurrence.${r}`) })}</option>
              ))}
            </select>
            {form.recurrence && (
              <span className="mt-1 block text-xs text-bark-400">{t('recurrence.hint')}</span>
            )}
          </Field>
          <Field label={t('form.notes')}>
            <textarea value={form.notes} onChange={set('notes')} rows={2} className={inputCls} />
          </Field>

          {error && <p className="text-sm text-overdue-tx">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-clay-500 py-2.5 font-medium text-cream-50 transition hover:bg-clay-600 disabled:opacity-60"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 font-medium text-bark-600 hover:bg-cream-200"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
