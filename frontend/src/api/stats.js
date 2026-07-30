import { api } from './client'

// Dashboard özet verilerini getir (GET /stats)
export async function getStats() {
  const { data } = await api.get('/stats')
  return data
}
