import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

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
