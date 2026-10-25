import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { basicAuthService } from '../services/basicAuthService.ts'
import { useSessionStore } from './useSessionStore.ts'

/**
 * Login Basic: verifica identidad, guarda sesión y avisa por toast.
 * El backend responde 401 bare tanto para email inexistente como para
 * password mala (indistinguible a propósito) → "Credenciales incorrectas".
 */
export function useBasicLogin() {
  const loginBasic = useSessionStore((state) => state.loginBasic)

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      basicAuthService.login(credentials),
    onSuccess: async (response, credentials) => {
      loginBasic(credentials.email, credentials.password, response.user)
      toast.success('Sesión iniciada', {
        description: `Bienvenido, ${response.user.name}.`,
      })

      // Fetch roles after successful login
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          headers: { Authorization: `Basic ${btoa(`${credentials.email}:${credentials.password}`)}` }
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
      if (error instanceof Response && error.status === 401) {
        toast.error('Credenciales incorrectas.')
        return
      }
      if (error instanceof Error && error.name === 'ApiError' && 'isUnauthorized' in error && error.isUnauthorized) {
        toast.error('Credenciales incorrectas.')
        return
      }
      toast.error('No se pudo iniciar sesión.')
    },
  })
}