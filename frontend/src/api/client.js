import axios from 'axios'
import { keycloak, tokenAl } from '../auth/keycloak'

// Tüm API isteklerinin ortak ayarı: backend adresimiz.
// Her istekte "http://localhost:8000" yazmamak için tek yerden yönetiyoruz.
export const api = axios.create({
  baseURL: 'http://localhost:8000',
})

/*
  ARA KATMAN (interceptor) — her isteğe otomatik olarak oturum token'ı ekler.

  Neden tek tek her istekte yazmıyoruz? Çünkü unutulur. Burada bir kez
  tanımlayınca uygulamadaki BÜTÜN istekler token'lı gider.
  🔎 "axios interceptors"
*/
api.interceptors.request.use(async (config) => {
  const token = await tokenAl()          // gerekiyorsa token'ı yeniler
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/*
  Cevap ara katmanı: 401 gelirse oturum geçersizdir -> giriş ekranına gönder.
  (Örn. Keycloak yeniden başlatıldıysa elimizdeki token artık geçersizdir.)
*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      keycloak.login()
    }
    return Promise.reject(error)
  },
)

/*
  Dosya indirme yardımcısı.

  NEDEN GEREKLİ? Normal bir <a href="..."> bağlantısı Authorization başlığı
  GÖNDEREMEZ — tarayıcı sadece adrese gider. Korumalı bir endpoint'ten dosya
  indirmek için dosyayı axios ile (token'lı) çekip, gelen veriyi geçici bir
  bağlantıya dönüştürüp öyle indiriyoruz.
  🔎 "download file with authorization header javascript blob"
*/
export async function dosyaIndir(url, dosyaAdi) {
  const { data, headers } = await api.get(url, { responseType: 'blob' })

  // Sunucu dosya adını Content-Disposition başlığında bildirebilir
  const disposition = headers['content-disposition'] || ''
  const eslesme = disposition.match(/filename="?([^"]+)"?/)
  const ad = eslesme ? decodeURIComponent(eslesme[1]) : dosyaAdi

  const gecici = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = gecici
  a.download = ad
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(gecici)   // belleği geri ver
}
