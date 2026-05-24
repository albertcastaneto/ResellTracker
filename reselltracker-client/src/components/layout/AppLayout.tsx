import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/inventory':    'Inventory',
  '/sales':        'Sales Log',
  '/platforms':    'Fees & Postage',
  '/suppliers':    'Suppliers',
  '/sku':          'SKU Generator',
  '/categories':   'Category Performance',
  '/sell-through': 'Sell Through',
  '/users':        'User Management',
}

export function AppLayout() {
  const { pathname } = useLocation()
  const title        = PAGE_TITLES[pathname] ?? 'ResellTracker'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar pageTitle={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
