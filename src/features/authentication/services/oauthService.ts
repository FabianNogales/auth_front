import { isAxiosError } from 'axios'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import type { OAuthCredentials, OAuthTokenPair } from '../types/oauth.ts'

function hasOAuthError(error: unknown, status: number, code: string): boolean {
  if (!isAxiosError<unknown>(error) || error.response?.status !== status) return false
  const data = error.response.data
  return typeof data === 'object' && data !== null && 'error' in data && data.error === code
}

function operationError(error: unknown, fallback: string): ApiError {
  const converted = toApiError(error, fallback)
  // No conservar la configuración Axios: puede contener contraseñas y tokens.
  return new ApiError(converted.message, {
    status: converted.status,
    code: converted.code,
    errors: converted.errors,
  })
}

export const oauthService = {
  async issueToken(credentials: OAuthCredentials): Promise<OAuthTokenPair> {
    try {
      const response = await httpClient.post<OAuthTokenPair>('/auth/oauth/token', {
        ...credentials,
        grant_type: 'password',
      })
      return response.data
    } catch (error: unknown) {
      if (hasOAuthError(error, 400, 'invalid_grant')) {
        throw new ApiError('No autorizado', { status: 400 })
      }
      throw operationError(error, 'No se pudo obtener el token OAuth')
    }
  },

  async revokeToken(token: string): Promise<'revoked' | 'already_revoked'> {
    try {
      const response = await httpClient.post<void>('/auth/oauth/revoke', { token })
      if (response.status !== 204) {
        throw new ApiError('Respuesta inesperada al revocar el token OAuth', { status: response.status })
      }
      return 'revoked'
    } catch (error: unknown) {
      if (hasOAuthError(error, 409, 'token_already_revoked')) return 'already_revoked'
      throw operationError(error, 'No se pudo revocar el token OAuth')
    }
  },
}

export function oauthFieldError(errors: unknown, field: string): string | undefined {
  if (typeof errors !== 'object' || errors === null || !(field in errors)) return undefined
  const value: unknown = Reflect.get(errors, field)
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.find((item: unknown): item is string => typeof item === 'string')
  return undefined
}
