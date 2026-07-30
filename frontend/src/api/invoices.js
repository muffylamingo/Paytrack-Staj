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

// --- Ek dosya (dekont) işlemleri ---

// Dosya yükle. FormData kullanıyoruz çünkü dosya JSON'a sığmaz;
// tarayıcı bunu "multipart/form-data" olarak gönderir (Content-Type'ı kendi ayarlar).
export async function uploadAttachment(id, file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/invoices/${id}/attachment`, form)
  return data
}

// Eki kaldır
export async function deleteAttachment(id) {
  const { data } = await api.delete(`/invoices/${id}/attachment`)
  return data
}

// İndirme bağlantısı (tarayıcı doğrudan açsın diye tam URL)
export function attachmentUrl(id) {
  return `${api.defaults.baseURL}/invoices/${id}/attachment`
}
