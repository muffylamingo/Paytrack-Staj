import { X, CheckCircle2, AlertTriangle } from 'lucide-react'

/*
  İçe aktarma sonuç raporu.
  Hatalı satır varsa açılır; kullanıcı hangi Excel satırında ne sorun olduğunu görür.

  Neden toast yetmiyor? Toast kısa ve tek satırlıktır; burada 20 satırlık bir
  liste olabilir ve kullanıcının bunu okuyup Excel'ini düzeltmesi gerekir.
*/
export default function ImportResultModal({ result, onClose }) {
  if (!result) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl bg-cream-50 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
          <h2 className="font-serif text-xl font-semibold text-bark-900">İçe Aktarma Raporu</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-bark-400 hover:bg-cream-200">
            <X size={20} />
          </button>
        </div>

        {/* Özet: eklenen / hatalı */}
        <div className="flex gap-3 px-5 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-paid-bg px-3 py-2 text-paid-tx">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">{result.imported} fatura eklendi</span>
          </div>
          {result.failed > 0 && (
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-overdue-bg px-3 py-2 text-overdue-tx">
              <AlertTriangle size={18} />
              <span className="text-sm font-medium">{result.failed} satır atlandı</span>
            </div>
          )}
        </div>

        {/* Hata listesi */}
        {result.errors?.length > 0 && (
          <div className="max-h-80 overflow-y-auto border-t border-cream-300 px-5 py-3">
            <p className="mb-2 text-xs text-bark-400">
              Aşağıdaki satırlar alınamadı. Excel dosyanda düzeltip tekrar yükleyebilirsin:
            </p>
            <ul className="space-y-1.5">
              {result.errors.map((e, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="shrink-0 rounded-md bg-cream-200 px-1.5 py-0.5 text-xs font-medium text-bark-600">
                    satır {e.row}
                  </span>
                  <span className="text-bark-700">{e.message}</span>
                </li>
              ))}
            </ul>
            {result.failed > result.errors.length && (
              <p className="mt-2 text-xs text-bark-400">
                …ve {result.failed - result.errors.length} hata daha (ilk {result.errors.length} tanesi gösteriliyor)
              </p>
            )}
          </div>
        )}

        <div className="border-t border-cream-300 px-5 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-clay-500 px-4 py-2 text-sm font-medium text-cream-50 transition hover:bg-clay-600"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  )
}
