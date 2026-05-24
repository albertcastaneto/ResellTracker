import { LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Badge } from '../ui/Badge'

const roleBadge: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  Owner:   'purple',
  Manager: 'blue',
  Lister:  'green',
  Viewer:  'gray',
}

interface Props {
  pageTitle: string
}

export function TopBar({ pageTitle }: Props) {
  const { user, logout } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold text-gray-900">{pageTitle}</h1>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-gray-600">{user.displayName}</span>
            <Badge variant={roleBadge[user.role] ?? 'gray'} label={user.role} />
          </>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
