import { useQuery } from '@tanstack/react-query'

import { userRolesService } from '../services/userRolesService.ts'

export function useUserNames() {
  const users = useQuery({ queryKey: ['users'], queryFn: userRolesService.getUsers })
  const names = new Map((users.data ?? []).map((user) => [user.id, user.name]))

  const nameOf = (id: number | null): string =>
    id === null ? '—' : (names.get(String(id)) ?? `Usuario #${id}`)

  return { users, nameOf }
}