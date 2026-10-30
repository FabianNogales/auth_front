import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import { userRolesService } from '../../users/services/userRolesService.ts'
import { experimentKeys } from '../constants/experiments.ts'
import { experimentService } from '../services/experimentService.ts'

export function useExperiments() {
  const userId = useSessionStore((state) => state.user?.id)
  const client = useQueryClient()
  const experiments = useQuery({ queryKey: experimentKeys.list(userId), queryFn: experimentService.list, retry: false })
  const users = useQuery({ queryKey: ['users'], queryFn: userRolesService.getUsers })
  const create = useMutation({
    mutationFn: experimentService.create,
    onSuccess: () => {
      toast.success('Experimento creado correctamente')
      void client.invalidateQueries({ queryKey: experimentKeys.all })
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return { experiments, users, create }
}
