import { api } from './client'

// Faturaları getir (opsiyonel filtreler: { status, category, vendor })
export async function getInvoices(params = {}) {
  const { data } = await api.get('/invoices', { params })
  return data
}

// Yeni fatura oluştur
export async function createInvoice(payload) {
  const { data } = await api.post('/invoices', payload)
  return data
}

// Faturayı "Ödendi" işaretle
export async function payInvoice(id) {
  const { data } = await api.patch(`/invoices/${id}/pay`)
  return data
}

// Faturayı sil
export async function deleteInvoice(id) {
  await api.delete(`/invoices/${id}`)
}
