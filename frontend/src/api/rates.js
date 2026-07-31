import { api } from './client'

// Döviz kurlarını getir ([{currency, rate, is_default, updated_at}])
export async function getRates() {
  const { data } = await api.get('/rates')
  return data
}

// Bir para biriminin TL kurunu güncelle
export async function setRate(currency, rate) {
  const { data } = await api.put(`/rates/${currency}`, { rate: Number(rate) })
  return data
}
