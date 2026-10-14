import { httpClient } from '../../../shared/services/httpClient.ts'
import { basicAuthHeaders } from '../../../shared/services/authHeaders.ts'
import { toApiError } from '../../../shared/services/ApiError.ts'
import type {
  BasicCredentials,
  BasicLoginResponse,
  LabUser,
} from '../types/auth.ts'

/**
 * Auth Basic contra el backend. Cada llamada lleva sus headers explícitos:
 * el httpClient nunca adjunta credenciales solo.
 */
export const basicAuthService = {
  /** Verifica identidad (email+password). 401 = credenciales incorrectas. */
  async login(credentials: BasicCredentials): Promise<BasicLoginResponse> {
    try {
      const { data } = await httpClient.post<BasicLoginResponse>(
        '/auth/basic/login',
        credentials,
      )
      return data
    } catch (error) {
      throw toApiError(error, 'No se pudo iniciar sesión.')
    }
  },

  /** Recurso protegido con header Basic explícito. 401 = no autenticado. */
  async protectedGet<T>(
    path: string,
    credentials: BasicCredentials,
  ): Promise<T> {
    try {
      const { data } = await httpClient.get<T>(path, {
        headers: basicAuthHeaders(credentials.email, credentials.password),
      })
      return data
    } catch (error) {
      throw toApiError(error, 'No autenticado.')
    }
  },

  async users(
    credentials: BasicCredentials,
  ): Promise<LabUser[]> {
    return basicAuthService.protectedGet<LabUser[]>('/users', credentials)
  },
}
