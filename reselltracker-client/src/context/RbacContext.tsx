import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

const ROLES = {
  Owner:   'Owner',
  Manager: 'Manager',
  Lister:  'Lister',
  Viewer:  'Viewer',
} as const

interface RbacContextType {
  hasRole: (roles: string[]) => boolean
  canDelete: () => boolean
  canEdit: () => boolean
  canViewReports: () => boolean
}

const RbacContext = createContext<RbacContextType | null>(null)

export function RbacProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role = user?.role ?? ''

  const hasRole = (roles: string[]) => roles.includes(role)

  return (
    <RbacContext.Provider value={{
      hasRole,
      canDelete:      () => hasRole([ROLES.Owner]),
      canEdit:        () => hasRole([ROLES.Owner, ROLES.Manager, ROLES.Lister]),
      canViewReports: () => hasRole([ROLES.Owner, ROLES.Manager, ROLES.Viewer]),
    }}>
      {children}
    </RbacContext.Provider>
  )
}

export function useRbac() {
  const ctx = useContext(RbacContext)
  if (!ctx) throw new Error('useRbac must be used inside RbacProvider')
  return ctx
}
