import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { isApiError } from '../../../shared/services/ApiError.ts'
import { userRolesService } from '../../users/services/userRolesService.ts'
import { basicAuthService } from '../services/basicAuthService.ts'
import type { BasicCredentials } from '../types/auth.ts'
import { useSessionStore } from './useSessionStore.ts'

export function useBasicLogin() {
  const loginBasic = useSessionStore((state) => state.loginBasic)
  const setRoles = useSessionStore((state) => state.setRoles)

  return useMutation({
    mutationFn: (credentials: BasicCredentials) =>
      basicAuthService.login(credentials),
    onSuccess: async (response, credentials) => {
      let roles: string[] = []
      try {
        const userWithRoles = await userRolesService.getUser(response.user.id)
        roles = userWithRoles.roles.map((role) => role.name)
      } catch {
        toast.warning('Sesión iniciada, pero no se pudieron cargar tus roles.')
      }

      loginBasic(credentials.email, credentials.password, response.user)
      setRoles(roles)
      toast.success('Sesión iniciada', {
        description: `Bienvenido, ${response.user.name}.`,
      })
    },
    onError: (error: unknown) => {
      if (isApiError(error) && error.isUnauthorized) {
        toast.error('Credenciales incorrectas.')
        return
      }
      toast.error('No se pudo iniciar sesión.')
    },
  })
}