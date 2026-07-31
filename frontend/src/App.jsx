import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Reports from './pages/Reports'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tüm sayfalar ortak Layout (menü + üst bar) içinde */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/panel" replace />} />
          <Route path="/panel" element={<Dashboard />} />
          <Route path="/faturalar" element={<Invoices />} />
          <Route path="/raporlar" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
