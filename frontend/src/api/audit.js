import { api } from './client'

// İşlem geçmişini getir. Filtreler: { entity: 'invoice'|'budget'|'rate', action: 'create'|'update'|'delete' }
// NOT: Sadece OKUMA var — denetim kaydı silinemez/düzenlenemez (kasıtlı).
export async function getAuditLog(params = {}) {
  const { data } = await api.get('/audit', { params })
  return data
}
