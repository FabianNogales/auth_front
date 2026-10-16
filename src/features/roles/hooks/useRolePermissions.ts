import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { permissionsService } from '../services/permissionsService.ts'
import { rolesService } from '../services/rolesService.ts'
import type { RoleResponse } from '../types/role.ts'
import { rolesQueryKey } from './useCreateRole.ts'

export function useRolePermissions(name: string) {
  const client = useQueryClient()
  const permissions = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsService.getPermissions,
  })
  const save = useMutation({
    mutationFn: (selected: string[]) => rolesService.syncPermissions(name, selected),
    onSuccess: async (_, selected) => {
      client.setQueryData<RoleResponse[]>(rolesQueryKey, (roles) =>
        roles?.map((role) => role.name === name ? { ...role, permissions: selected } : role),
      )
      toast.success('Permisos actualizados correctamente')
      await Promise.all([
        client.invalidateQueries({ queryKey: rolesQueryKey }),
        client.invalidateQueries({ queryKey: ['user'] }),
      ])
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return { permissions, save }
}
