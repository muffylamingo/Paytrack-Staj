import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* ThemeProvider en dışta: tema bilgisi tüm uygulamada erişilebilir olsun */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
