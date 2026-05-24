import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: string
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',   label: 'Dashboard',       icon: '📈', roles: ['Owner','Manager','Viewer'] },
  { to: '/inventory',   label: 'Inventory',        icon: '📦', roles: ['Owner','Manager','Lister'] },
  { to: '/sales',       label: 'Sales Log',        icon: '💰', roles: ['Owner','Manager','Viewer'] },
  { to: '/platforms',   label: 'Fees & Postage',   icon: '📋', roles: ['Owner','Manager'] },
  { to: '/suppliers',   label: 'Suppliers',        icon: '🏭', roles: ['Owner','Manager'] },
  { to: '/sku',         label: 'SKU Generator',    icon: '🔖', roles: ['Owner','Manager','Lister'] },
  { to: '/categories',  label: 'Category Perf.',   icon: '📊', roles: ['Owner','Manager','Viewer'] },
  { to: '/sell-through',label: 'Sell Through',     icon: '⚙️',  roles: ['Owner','Manager','Viewer'] },
  { to: '/users',       label: 'User Management',  icon: '👥', roles: ['Owner'] },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user }                  = useAuth()
  const role = user?.role ?? ''

  const visible = NAV_ITEMS.filter(item => item.roles.includes(role))

  return (
    <aside className={`flex flex-col bg-gray-900 text-white transition-all duration-200 shrink-0
      ${collapsed ? 'w-14' : 'w-56'}`}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 h-14 px-4 border-b border-gray-700 shrink-0">
        <span className="text-lg">📦</span>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight">ResellTracker</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto text-gray-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {visible.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
               ${isActive
                 ? 'bg-indigo-600 text-white'
                 : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
