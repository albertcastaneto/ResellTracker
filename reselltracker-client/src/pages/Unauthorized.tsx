import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

const roleBadge: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  Owner:   'purple',
  Manager: 'blue',
  Lister:  'green',
  Viewer:  'gray',
}

export default function Unauthorized() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 text-gray-500">You don't have permission to view this page.</p>
        {user && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
            <span>Your role:</span>
            <Badge variant={roleBadge[user.role] ?? 'gray'} label={user.role} />
          </div>
        )}
        <Button onClick={() => navigate('/dashboard')} className="mt-6">
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
