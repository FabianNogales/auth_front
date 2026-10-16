import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { permissionsService } from '../services/permissionsService.ts'
import { rolesService } from '../services/rolesService.ts'

export const rolesQueryKey = ['roles'] as const

export function useCreateRole() {
  const client = useQueryClient()
  const permissions = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionsService.getPermissions,
  })
  const createRole = useMutation({
    mutationFn: rolesService.createRole,
    onSuccess: () => {
      toast.success('Rol creado correctamente')
      void client.invalidateQueries({ queryKey: rolesQueryKey })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
  return { permissions, createRole }
}
