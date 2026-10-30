import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { useSessionStore } from '../hooks/useSessionStore.ts'

type ProtectedRouteProps = {
  children: ReactNode
  /**
   * Roles con permiso para ver la página. Vacío = solo exige autenticación.
   * Solo UI: la autorización real la decide el backend por request.
   */
  roles?: string[]
  permissions?: string[]
  redirectTo?: string
}

/**
 * Protector de rutas: sin sesión → login; con roles exigidos y sin
 * coincidencia → inicio. Las páginas públicas no lo usan.
 */
export function ProtectedRoute({
  children,
  roles = [],
  permissions = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const user = useSessionStore((state) => state.user)
  const sessionRoles = useSessionStore((state) => state.roles)
  const sessionPermissions = useSessionStore((state) => state.permissions)

  if (user === null) {
    return <Navigate to={redirectTo} replace />
  }

  if (roles.length > 0 && !roles.some((role) => sessionRoles.includes(role))) {
    return <Navigate to="/" replace />
  }

  if (permissions.length > 0 && !permissions.some((permission) => sessionPermissions.includes(permission))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
