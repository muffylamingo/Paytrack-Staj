import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { keycloak } from './auth/keycloak.js'

/*
  UYGULAMA ÖNCE GİRİŞİ BEKLER (Faz 7)
  -----------------------------------
  React'i hemen çizmiyoruz; önce Keycloak'a "bu kullanıcı giriş yapmış mı?"
  diye soruyoruz. `onLoad: 'login-required'` = giriş yapılmamışsa kullanıcı
  otomatik olarak Keycloak'ın giriş sayfasına yönlendirilir.

  Neden render'dan ÖNCE? Çünkü uygulama açılır açılmaz API isteği atıyor;
  token hazır olmadan çizersek ilk istekler 401 alırdı.

  pkceMethod 'S256': Modern güvenlik önerisi. Yetkilendirme kodunun yolda
  çalınmasına karşı koruma sağlar. 🔎 "PKCE oauth"
*/
keycloak
  .init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
    checkLoginIframe: false,   // sekmeler arası kontrol iframe'i (yerelde gürültü yapıyor)
  })
  .then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        {/* Sağlayıcılar en dışta: tema, dil ve bildirimler tüm uygulamadan erişilebilsin.
            Dil en dışta, çünkü bildirim metinleri de çevrilecek. */}
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </StrictMode>,
    )
  })
  .catch((err) => {
    // Keycloak kapalıysa kullanıcı bomboş beyaz ekran görmesin, sebebini anlasın
    document.getElementById('root').innerHTML = `
      <div style="font-family:system-ui;padding:3rem;max-width:640px;margin:auto;color:#2C2418">
        <h1 style="font-size:1.5rem">Giriş sunucusuna ulaşılamıyor</h1>
        <p style="color:#6B5D4B">Keycloak (http://localhost:8080) çalışmıyor olabilir.</p>
        <pre style="background:#F5EFE3;padding:1rem;border-radius:12px;font-size:.85rem">docker compose up -d</pre>
        <p style="color:#9A8B78;font-size:.85rem">${err ?? ''}</p>
      </div>`
  })
