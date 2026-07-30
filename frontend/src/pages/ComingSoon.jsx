// Genel "yakında" sayfası (henüz yapılmamış bölümler için)
export default function ComingSoon({ title = 'Yakında' }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h1 className="font-serif text-3xl font-semibold text-bark-900">{title}</h1>
      <p className="mt-2 text-bark-500">Bu bölüm yakında eklenecek. 🌱</p>
    </div>
  )
}
