// Üst bar: karşılama + tarih + kullanıcı avatarı
export default function Topbar() {
  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <header className="flex items-center justify-between border-b border-cream-300 bg-cream-50 px-6 py-4">
      <div>
        <p className="text-xs text-bark-400">Hoş geldin 👋</p>
        <p className="text-sm font-medium text-bark-800">{today}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bark-600 text-xs font-semibold text-cream-50">
        OK
      </div>
    </header>
  )
}
