import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Reports from './pages/Reports'
import History from './pages/History'

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
          <Route path="/gecmis" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
