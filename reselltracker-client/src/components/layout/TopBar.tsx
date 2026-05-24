import { useAuth } from '../../context/AuthContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

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
      <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-gray-700 font-medium">{user.displayName}</span>
            <Badge variant={roleBadge[user.role] ?? 'gray'} label={user.role} />
          </>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
      </div>
    </header>
  )
}
