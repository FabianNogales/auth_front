import { useQueries, useQuery } from '@tanstack/react-query'

import type { LabUser } from '../../authentication/types/auth.ts'
import { userRolesService } from '../services/userRolesService.ts'

export interface UserRow extends LabUser {
  roles: string[]
  rolesLoaded: boolean
}

/**
 * Usuarios + sus roles. El back no incluye roles en GET /users, así que se
 * pide GET /users/{id} por usuario (comparte caché con useUserRoles).
 */
export function useUsersWithRoles() {
  const users = useQuery({ queryKey: ['users'], queryFn: userRolesService.getUsers })
  const list = users.data ?? []
  const details = useQueries({
    queries: list.map((user) => ({
      queryKey: ['user', user.id] as const,
      queryFn: () => userRolesService.getUser(user.id),
      staleTime: 30_000,
    })),
  })

  const rows: UserRow[] = list.map((user, index) => {
    const detail = details[index]

    return {
      ...user,
      roles: detail?.data?.roles.map((role) => role.name) ?? [],
      rolesLoaded: detail !== undefined && !detail.isPending,
    }
  })

  return {
    users,
    rows,
    rolesLoading: users.isPending || rows.some((row) => !row.rolesLoaded),
    rolesError: details.some((detail) => detail.isError),
  }
}