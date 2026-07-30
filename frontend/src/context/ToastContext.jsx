import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

/*
  Toast (anlık bildirim) sistemi
  ------------------------------
  Amaç: kullanıcı bir işlem yaptığında ("Kaydet", "Öde") ekranın sağ üstünde
  kısa bir geri bildirim çıksın ve kendiliğinden kaybolsun.

  Neden alert() değil? alert() sayfayı dondurur, çirkindir ve tasarıma uymaz.

  Kullanımı (herhangi bir bileşende):
      const toast = useToast()
      toast.success('Fatura kaydedildi')
      toast.error('Kaydedilemedi')
      toast.info('Excel indiriliyor…')

  Renkler tema değişkenlerinden geldiği için karanlık modda otomatik uyumlu.
*/

const ToastContext = createContext(null)
const DURATION = 3500 // ms — ekranda kalma süresi

const STYLES = {
  success: { cls: 'bg-paid-bg text-paid-tx border-paid-tx/25', Icon: CheckCircle2 },
  error:   { cls: 'bg-overdue-bg text-overdue-tx border-overdue-tx/25', Icon: AlertTriangle },
  info:    { cls: 'bg-pending-bg text-pending-tx border-pending-tx/25', Icon: Info },
}

function Toast({ type, message, onClose }) {
  const { cls, Icon } = STYLES[type] ?? STYLES.info
  return (
    <div
      role="status"
      className={`pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-lg animate-toast-in ${cls}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="shrink-0 rounded-lg p-0.5 opacity-60 transition hover:opacity-100" title="Kapat">
        <X size={15} />
      </button>
      {/* Alttaki süre çubuğu: ne kadar süre kaldığını gösterir */}
      <span
        className="toast-bar absolute bottom-0 left-0 h-0.5 bg-current opacity-40"
        style={{ animationDuration: `${DURATION}ms` }}
      />
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      // crypto.randomUUID: çakışmayan benzersiz kimlik (React'in key'i için)
      const id = crypto.randomUUID()
      setToasts((list) => [...list, { id, type, message }])
      setTimeout(() => remove(id), DURATION)
    },
    [remove],
  )

  // useMemo: her render'da yeni nesne üretmesin (useEffect bağımlılıkları bozulmasın)
  const toast = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Bildirimlerin durduğu sabit alan — sağ üst, üst üste dizilir */}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast, ToastProvider içinde kullanılmalı')
  return ctx
}
