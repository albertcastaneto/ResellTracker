import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Receipt, Percent, Building2,
  Hash, BarChart2, TrendingUp, Users, ChevronLeft, ChevronRight,
  type LucideIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',    label: 'Dashboard',        Icon: LayoutDashboard, roles: ['Owner','Manager','Viewer'] },
  { to: '/inventory',    label: 'Inventory',         Icon: Package,         roles: ['Owner','Manager','Lister'] },
  { to: '/sales',        label: 'Sales Log',         Icon: Receipt,         roles: ['Owner','Manager','Viewer'] },
  { to: '/platforms',    label: 'Fees & Postage',    Icon: Percent,         roles: ['Owner','Manager'] },
  { to: '/suppliers',    label: 'Suppliers',         Icon: Building2,       roles: ['Owner','Manager'] },
  { to: '/sku',          label: 'SKU Generator',     Icon: Hash,            roles: ['Owner','Manager','Lister'] },
  { to: '/categories',   label: 'Category Perf.',    Icon: BarChart2,       roles: ['Owner','Manager','Viewer'] },
  { to: '/sell-through', label: 'Sell Through',      Icon: TrendingUp,      roles: ['Owner','Manager','Viewer'] },
  { to: '/users',        label: 'User Management',   Icon: Users,           roles: ['Owner'] },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user }                  = useAuth()
  const role = user?.role ?? ''

  const visible = NAV_ITEMS.filter(item => item.roles.includes(role))

  return (
    <aside className={`flex flex-col bg-gray-900 shrink-0 transition-all duration-200 ${collapsed ? 'w-14' : 'w-56'}`}>
      {/* Brand */}
      <div className="flex items-center h-14 px-3 border-b border-gray-700 shrink-0">
        {!collapsed && (
          <span className="text-sm font-semibold text-white tracking-tight flex-1">ResellTracker</span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`text-gray-400 hover:text-white transition-colors p-1 rounded ${collapsed ? 'mx-auto' : 'ml-auto'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visible.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-md text-sm transition-colors
               ${isActive
                 ? 'bg-indigo-600 text-white'
                 : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
