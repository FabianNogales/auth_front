import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userRolesService } from '../services/userRolesService.ts'
import type { UserWithRoles } from '../types/userRoles.ts'
import type { RoleResponse } from '../../roles/types/role.ts'

export function useUserRoles(userId: string) {
  const client = useQueryClient()
  const userKey = ['user', userId] as const
  const users = useQuery({ queryKey: ['users'], queryFn: userRolesService.getUsers })
  const user = useQuery({
    queryKey: userKey,
    queryFn: () => userRolesService.getUser(userId),
    enabled: userId !== '',
    retry: false,
  })
  const refresh = () => Promise.all([
    client.invalidateQueries({ queryKey: userKey }),
    client.invalidateQueries({ queryKey: ['users'] }),
  ])
  const assign = useMutation({
    mutationFn: (role: RoleResponse) => userRolesService.assign(userId, role.name),
    onSuccess: async (_, role) => {
      client.setQueryData<UserWithRoles>(userKey, (current) => current ? {
        ...current,
        roles: [...current.roles.filter((item) => item.name !== role.name), role],
      } : current)
      toast.success('Rol asignado correctamente')
      await refresh()
    },
    onError: (error: Error) => {
      toast.error(error.message)
      void refresh()
    },
  })
  const revoke = useMutation({
    mutationFn: (name: string) => userRolesService.revoke(userId, name),
    onSuccess: async (_, name) => {
      client.setQueryData<UserWithRoles>(userKey, (current) => current ? {
        ...current, roles: current.roles.filter((role) => role.name !== name),
      } : current)
      toast.success('Rol revocado correctamente')
      await refresh()
    },
    onError: (error: Error) => {
      toast.error(error.message)
      void refresh()
    },
  })
  return { users, user, assign, revoke }
}
