import { useQuery } from '@tanstack/react-query'
import { rolesQueryKey } from './useCreateRole.ts'
import { rolesService } from '../services/rolesService.ts'

export function useRoles() {
  return useQuery({ queryKey: rolesQueryKey, queryFn: rolesService.getRoles })
}
