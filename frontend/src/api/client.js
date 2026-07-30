import axios from 'axios'

// Tüm API isteklerinin ortak ayarı: backend adresimiz.
// Her istekte "http://localhost:8000" yazmamak için tek yerden yönetiyoruz.
export const api = axios.create({
  baseURL: 'http://localhost:8000',
})
