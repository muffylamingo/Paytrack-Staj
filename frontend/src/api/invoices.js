import { api, dosyaIndir } from './client'

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

// Tekrarlayan faturaların eksik tekrarlarını üret (idempotent: kopya oluşturmaz)
export async function generateRecurring() {
  const { data } = await api.post('/invoices/generate-recurring')
  return data // { created: sayı, invoices: [...] }
}

// --- Excel içe aktarma (Ekstra #7) ---

// Doldurulmuş .xlsx dosyasından toplu fatura yükle
export async function importInvoices(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/invoices/import', form)
  return data // { imported, failed, errors: [{row, message}] }
}

// Boş şablonu indir (token gerektiği için düz <a href> ile olmaz)
export function downloadTemplate() {
  return dosyaIndir('/invoices/import-template', 'fatura-sablonu.xlsx')
}

// Faturaları Excel olarak indir (mevcut filtre/sıralama ile)
export function downloadExport(params = {}) {
  const qs = new URLSearchParams(params).toString()
  return dosyaIndir(`/invoices/export?${qs}`, 'faturalar.xlsx')
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

// Ek dosyayı indir (token'lı)
export function downloadAttachment(id, name) {
  return dosyaIndir(`/invoices/${id}/attachment`, name || 'ek-dosya')
}
