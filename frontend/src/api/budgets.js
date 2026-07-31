import { api } from './client'

// Bütçeleri getir (limit + bu ayki harcama + yüzde + durum)
export async function getBudgets() {
  const { data } = await api.get('/budgets')
  return data
}

// Bütçe belirle/güncelle (upsert). Kategori Türkçe karakter içerebilir ->
// encodeURIComponent ile URL'e güvenli şekilde gömüyoruz ("Yazılım" -> "Yaz%C4%B1l%C4%B1m").
export async function setBudget(category, monthlyLimit) {
  const { data } = await api.put(`/budgets/${encodeURIComponent(category)}`, {
    monthly_limit: Number(monthlyLimit),
  })
  return data
}

// Bütçeyi kaldır
export async function deleteBudget(category) {
  await api.delete(`/budgets/${encodeURIComponent(category)}`)
}
