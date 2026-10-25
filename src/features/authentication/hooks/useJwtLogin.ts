import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { isApiError } from '../../../shared/services/ApiError.ts'
import { jwtAuthService } from '../services/jwtAuthService.ts'
import { useSessionStore } from './useSessionStore.ts'

/**
 * Login JWT: verifica identidad (email+password), guarda el token y el usuario
 * y redirige. El backend responde 401 bare para credenciales inválidas.
 */
export function useJwtLogin() {
  const loginJwt = useSessionStore((state) => state.loginJwt)
  const apiUrl = import.meta.env.VITE_API_URL

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      jwtAuthService.login(credentials),
    onSuccess: async (response) => {
      loginJwt(response.token, response.user)
      toast.success('Sesión iniciada', {
        description: `Bienvenido, ${response.user.name}.`,
      })

      // Fetch roles after successful login
      try {
        const res = await fetch(`${apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${response.token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.roles) {
            useSessionStore.getState().setRoles(data.roles.map((r: { name: string }) => r.name))
          }
        }
      } catch {
        // Silently fail, roles will be empty
      }
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