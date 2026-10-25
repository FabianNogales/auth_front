import { httpClient } from '../../../shared/services/httpClient.ts'
import { toApiError } from '../../../shared/services/ApiError.ts'
import type { LabUser } from '../types/auth.ts'

/**
 * Servicio de autenticación JWT.
 *
 * El login JWT usa email+password (igual que Basic) pero devuelve un token JWT.
 * El refresh usa el mismo access token para emitir uno nuevo (rotación).
 * La revocación invalida el token por su jti.
 */
export const jwtAuthService = {
  /** Login JWT con email+password. Devuelve access token + expiración. */
  async login(credentials: { email: string; password: string }): Promise<{
    user: LabUser
    mechanism: string
    token: string
    expires_at: string
  }> {
    try {
      const { data } = await httpClient.post<{
        user: LabUser
        mechanism: string
        token: string
        expires_at: string
      }>('/auth/jwt/login', {
        email: credentials.email,
        password: credentials.password,
      })
      return data
    } catch (error) {
      throw toApiError(error, 'No se pudo iniciar sesión.')
    }
  },

  /** Refresh JWT: rota el token (emite nuevo, revoca el anterior). */
  async refresh(token: string): Promise<{ token: string; expires_at: string }> {
    try {
      const { data } = await httpClient.post<{
        token: string
        expires_at: string
      }>('/auth/jwt/refresh', { token })
      return data
    } catch (error) {
      throw toApiError(error, 'No se pudo renovar el token.')
    }
  },

  /** Revoca un token JWT por su jti. */
  async revoke(token: string): Promise<void> {
    try {
      await httpClient.post('/auth/jwt/revoke', { token })
    } catch (error) {
      throw toApiError(error, 'No se pudo revocar el token.')
    }
  },
}