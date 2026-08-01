import { useRef, useState } from 'react'
import { Paperclip, Upload, Download, X, Loader2 } from 'lucide-react'
import { uploadAttachment, deleteAttachment, downloadAttachment } from '../api/invoices'
import { useToast } from '../context/ToastContext'
import { useLang } from '../context/LanguageContext'

/*
  Tablodaki "Ek" sütunu.
  - Dosya yoksa : yükleme (📎+) butonu
  - Dosya varsa : dosya adı (tıklayınca indirir) + kaldır (X) butonu

  Not: <input type="file"> tarayıcının çirkin varsayılan görünümüne sahiptir ve
  stillendirilemez. O yüzden onu GİZLİYORUZ (hidden) ve kendi butonumuza tıklanınca
  ref üzerinden .click() ile açıyoruz — yaygın bir React kalıbı.
*/
export default function AttachmentCell({ invoice, onChanged }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()
  const { t } = useLang()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // aynı dosyayı tekrar seçebilmek için sıfırla
    if (!file) return

    setBusy(true)
    try {
      await uploadAttachment(invoice.id, file)
      toast.success(t('toast.fileUploaded', { name: file.name }))
      onChanged()
    } catch (err) {
      // Backend'in açıklayıcı mesajını (örn. "Sadece PDF...") kullanıcıya göster
      toast.error(err.response?.data?.detail || t('toast.fileUploadFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    setBusy(true)
    try {
      await deleteAttachment(invoice.id)
      toast.success(t('toast.fileRemoved'))
      onChanged()
    } catch {
      toast.error(t('toast.fileRemoveFailed'))
    } finally {
      setBusy(false)
    }
  }

  if (busy) return <Loader2 size={15} className="animate-spin text-bark-400" />

  // --- Dosya YOK: yükleme butonu ---
  if (!invoice.attachment_name) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => inputRef.current?.click()}
          title={t('attachment.upload')}
          className="rounded-lg p-1.5 text-bark-400 transition hover:bg-cream-200 hover:text-clay-600"
        >
          <Upload size={15} />
        </button>
      </>
    )
  }

  // --- Dosya VAR: indir + kaldır ---
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => downloadAttachment(invoice.id, invoice.attachment_name)}
        title={t('attachment.downloadTitle', { name: invoice.attachment_name })}
        className="inline-flex max-w-[130px] items-center gap-1 rounded-lg border border-cream-300 px-2 py-1 text-xs text-bark-700 transition hover:border-clay-400 hover:text-clay-600"
      >
        <Paperclip size={13} className="shrink-0" />
        <span className="truncate">{invoice.attachment_name}</span>
        <Download size={12} className="shrink-0 opacity-60" />
      </button>
      <button
        onClick={handleRemove}
        title={t('attachment.remove')}
        className="rounded-lg p-1 text-bark-400 transition hover:bg-overdue-bg hover:text-overdue-tx"
      >
        <X size={13} />
      </button>
    </div>
  )
}
