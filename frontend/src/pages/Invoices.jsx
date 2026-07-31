import { useEffect, useRef, useState } from 'react'
import { Plus, Search, Check, ChevronUp, ChevronDown, ChevronsUpDown, Download, Repeat, Upload, FileDown } from 'lucide-react'
import { getInvoices, payInvoice, generateRecurring, importInvoices, templateUrl } from '../api/invoices'
import ImportResultModal from '../components/ImportResultModal'
import { formatCurrency, formatDate, statusBadge, isNearDue } from '../lib/format'
import InvoiceFormModal from '../components/InvoiceFormModal'
import { useToast } from '../context/ToastContext'
import AttachmentCell from '../components/AttachmentCell'

const STATUSES = ['Bekliyor', 'Ödendi', 'Gecikti']
const CATEGORIES = ['Enerji', 'Yazılım', 'Kira', 'Mutfak']

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('due_date')
  const [order, setOrder] = useState('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef(null)
  const toast = useToast()

  async function load() {
    setLoading(true)
    const params = { sort, order }
    if (status) params.status = status
    if (category) params.category = category
    if (search) params.vendor = search
    try {
      setInvoices(await getInvoices(params))
    } catch {
      toast.error('Faturalar yüklenemedi — backend çalışıyor mu?')
    } finally {
      setLoading(false)
    }
  }

  // Filtre/arama/sıralama değişince yeniden yükle (aramada 300ms bekle = daha az istek)
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, category, sort, order])

  async function handlePay(id, vendor) {
    try {
      await payInvoice(id)
      toast.success(`${vendor} ödendi olarak işaretlendi`)
      load()
    } catch {
      toast.error('Ödeme işlenemedi')
    }
  }

  // Excel indir: mevcut filtre/sıralama ile export endpoint'ine yönlendir (tarayıcı dosyayı indirir)
  function handleExport() {
    const params = new URLSearchParams({ sort, order })
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    if (search) params.set('vendor', search)
    const a = document.createElement('a')
    a.href = `http://localhost:8000/invoices/export?${params.toString()}`
    a.download = 'faturalar.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast.info(`${invoices.length} fatura Excel'e aktarılıyor…`)
  }

  // Excel'den toplu yükle
  async function handleImport(e) {
    const file = e.target.files?.[0]
    e.target.value = ''            // aynı dosya tekrar seçilebilsin
    if (!file) return

    setImporting(true)
    try {
      const result = await importInvoices(file)
      load()
      if (result.failed === 0) {
        toast.success(`${result.imported} fatura içe aktarıldı`)
      } else {
        // Hata varsa detaylı raporu aç (toast'a 20 satır sığmaz)
        toast.info(`${result.imported} eklendi, ${result.failed} satır atlandı`)
        setImportResult(result)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Dosya içe aktarılamadı')
    } finally {
      setImporting(false)
    }
  }

  // Tekrarlayan faturaların eksik dönemlerini üret
  async function handleGenerate() {
    setGenerating(true)
    try {
      const { created } = await generateRecurring()
      if (created > 0) {
        toast.success(`${created} tekrar faturası oluşturuldu`)
        load()
      } else {
        // Kopya üretmediği için "hiçbir şey yapılmadı" da başarılı bir sonuçtur
        toast.info('Oluşturulacak yeni tekrar yok — hepsi güncel')
      }
    } catch {
      toast.error('Tekrarlar oluşturulamadı')
    } finally {
      setGenerating(false)
    }
  }

  // Bir sütuna tıklayınca: aynı sütunsa yönü çevir, farklıysa o sütuna geç (artan)
  function toggleSort(field) {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(field)
      setOrder('asc')
    }
  }

  // Başlıktaki ok ikonu
  function sortIcon(field) {
    if (sort !== field) return <ChevronsUpDown size={14} className="opacity-40" />
    return order === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  // Tıklanabilir başlık hücresi
  function Th({ field, children, align = 'left' }) {
    const active = sort === field
    return (
      <th className={`px-4 py-3 ${align === 'right' ? 'text-right' : ''}`}>
        <button
          onClick={() => toggleSort(field)}
          className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''} ${
            active ? 'text-clay-600' : 'transition hover:text-bark-600'
          }`}
        >
          {children}
          {sortIcon(field)}
        </button>
      </th>
    )
  }

  return (
    <div>
      {/* Başlık + Yeni Fatura */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-bark-900">Faturalar</h1>
          <p className="text-sm text-bark-400">{invoices.length} kayıt</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Gizli dosya seçici — kendi butonumuzla tetikliyoruz */}
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            title="Doldurulmuş .xlsx dosyasından toplu fatura yükle"
            className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-medium text-bark-700 transition hover:bg-cream-200 disabled:opacity-60"
          >
            <Upload size={18} /> {importing ? 'Yükleniyor…' : "Excel'den Yükle"}
          </button>
          <a
            href={templateUrl()}
            title="Doğru sütunları içeren boş şablonu indir"
            className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm font-medium text-bark-400 transition hover:bg-cream-200 hover:text-bark-700"
          >
            <FileDown size={18} />
          </a>
          <button
            onClick={handleGenerate}
            disabled={generating}
            title="Kira/abonelik gibi tekrarlayan faturaların yaklaşan dönemlerini oluşturur"
            className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-medium text-bark-700 transition hover:bg-cream-200 disabled:opacity-60"
          >
            <Repeat size={18} className={generating ? 'animate-spin' : ''} /> Tekrarları Oluştur
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm font-medium text-bark-700 transition hover:bg-cream-200"
          >
            <Download size={18} /> Excel'e Aktar
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-clay-500 px-4 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-clay-600"
          >
            <Plus size={18} /> Yeni Fatura
          </button>
        </div>
      </div>

      {/* Filtre çubuğu */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tedarikçi ara..."
            className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2 pl-10 pr-3 text-sm text-bark-900 outline-none placeholder:text-bark-400 focus:border-clay-400"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-bark-800 outline-none focus:border-clay-400"
        >
          <option value="">Tüm durumlar</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm text-bark-800 outline-none focus:border-clay-400"
        >
          <option value="">Tüm kategoriler</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tablo */}
      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-300 bg-cream-100 text-xs uppercase tracking-wide text-bark-400">
            <tr>
              <Th field="invoice_number">Fatura No</Th>
              <Th field="vendor_name">Tedarikçi</Th>
              <th className="px-4 py-3">Kategori</th>
              <Th field="amount" align="right">Tutar</Th>
              <Th field="due_date">Son Ödeme</Th>
              <Th field="status">Durum</Th>
              <th className="px-4 py-3 text-right">Ek</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-bark-400">
                  Yükleniyor…
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-bark-400">
                  Fatura bulunamadı. “Yeni Fatura” ile ekleyebilirsin.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const near = isNearDue(inv)
                return (
                  <tr key={inv.id} className={near ? 'bg-overdue-bg/40' : 'hover:bg-cream-100'}>
                    <td className="px-4 py-3 font-medium text-bark-900">
                      <span className="flex items-center gap-1.5">
                        {inv.invoice_number}
                        {inv.recurrence && (
                          <span
                            title={
                              inv.recurrence_parent_id
                                ? `${inv.recurrence} tekrar — otomatik oluşturuldu`
                                : `${inv.recurrence} tekrarlayan (seri başı)`
                            }
                            className="inline-flex items-center gap-0.5 rounded-full bg-cream-200 px-1.5 py-0.5 text-[10px] font-medium text-bark-600"
                          >
                            <Repeat size={10} />
                            {inv.recurrence}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-bark-800">{inv.vendor_name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cream-200 px-2.5 py-1 text-xs text-bark-700">
                        {inv.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-bark-900">
                      {formatCurrency(inv.amount, inv.currency)}
                    </td>
                    <td className={`px-4 py-3 ${near ? 'font-medium text-overdue-tx' : 'text-bark-600'}`}>
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AttachmentCell invoice={inv} onChanged={load} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.status !== 'Ödendi' && (
                        <button
                          onClick={() => handlePay(inv.id, inv.vendor_name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-paid-tx/30 px-2.5 py-1 text-xs font-medium text-paid-tx transition hover:bg-paid-bg"
                        >
                          <Check size={14} /> Öde
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Yeni fatura formu */}
      <InvoiceFormModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={load} />

      {/* İçe aktarma sonuç raporu (sadece hatalı satır varsa açılır) */}
      <ImportResultModal result={importResult} onClose={() => setImportResult(null)} />
    </div>
  )
}
