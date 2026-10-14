import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { isApiError } from '../../../shared/services/ApiError.ts'
import { basicAuthService } from '../services/basicAuthService.ts'
import type { BasicCredentials } from '../types/auth.ts'
import { useSessionStore } from './useSessionStore.ts'

/**
 * Login Basic: verifica identidad, guarda sesión y avisa por toast.
 * El backend responde 401 bare tanto para email inexistente como para
 * password mala (indistinguible a propósito) → "Credenciales incorrectas".
 */
export function useBasicLogin() {
  const loginBasic = useSessionStore((state) => state.loginBasic)

  return useMutation({
    mutationFn: (credentials: BasicCredentials) =>
      basicAuthService.login(credentials),
    onSuccess: (response, credentials) => {
      loginBasic(credentials.email, credentials.password, response.user)
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
