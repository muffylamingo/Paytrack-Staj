import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ReminderBanner from './ReminderBanner'

// Genel iskelet: solda menü, üstte bar, ortada sayfa içeriği (<Outlet/>)
export default function Layout() {
  return (
    <div className="flex h-screen bg-cream-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <ReminderBanner />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
