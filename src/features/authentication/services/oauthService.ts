import { isAxiosError } from 'axios'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import type { OAuthCredentials, OAuthTokenPair } from '../types/oauth.ts'
import { bearerHeaders } from '../../../shared/services/authHeaders.ts'

function hasOAuthError(error: unknown, status: number, code: string): boolean {
  if (!isAxiosError<unknown>(error) || error.response?.status !== status)
    return false
  const data = error.response.data
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    data.error === code
  )
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
  async protectedRequest(token: string): Promise<unknown> {
    try {
      return (
        await httpClient.get('/tickets', {
          headers: bearerHeaders(token.trim(), 'oauth'),
        })
      ).data
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401)
        throw new ApiError('No autenticado', { status: 401 })
      if (isAxiosError(error) && error.response?.status === 403)
        throw new ApiError('No tienes permisos para acceder a este recurso', {
          status: 403,
        })
      throw operationError(error, 'No se pudo enviar la solicitud OAuth')
    }
  },

  async refreshToken(refreshToken: string): Promise<OAuthTokenPair> {
    try {
      return (
        await httpClient.post<OAuthTokenPair>('/auth/oauth/refresh', {
          refresh_token: refreshToken.trim(),
        })
      ).data
    } catch (error: unknown) {
      if (hasOAuthError(error, 400, 'invalid_grant')) {
        const data = isAxiosError<{ reason?: string }>(error)
          ? error.response?.data
          : undefined
        const message =
          data?.reason === 'expired_token'
            ? 'El token de renovación ha expirado'
            : data?.reason === 'revoked_token'
              ? 'El token de renovación ha sido revocado'
              : 'El token de renovación no es válido'
        throw new ApiError(message, { status: 400 })
      }
      throw operationError(error, 'No se pudo renovar el token OAuth')
    }
  },
  async issueToken(credentials: OAuthCredentials): Promise<OAuthTokenPair> {
    try {
      const response = await httpClient.post<OAuthTokenPair>(
        '/auth/oauth/token',
        {
          ...credentials,
          grant_type: 'password',
        },
      )
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
      const response = await httpClient.post<void>('/auth/oauth/revoke', {
        token,
      })
      if (response.status !== 204) {
        throw new ApiError('Respuesta inesperada al revocar el token OAuth', {
          status: response.status,
        })
      }
      return 'revoked'
    } catch (error: unknown) {
      if (hasOAuthError(error, 409, 'token_already_revoked'))
        return 'already_revoked'
      throw operationError(error, 'No se pudo revocar el token OAuth')
    }
  },
}

export function oauthFieldError(
  errors: unknown,
  field: string,
): string | undefined {
  if (typeof errors !== 'object' || errors === null || !(field in errors))
    return undefined
  const value: unknown = Reflect.get(errors, field)
  if (typeof value === 'string') return value
  if (Array.isArray(value))
    return value.find(
      (item: unknown): item is string => typeof item === 'string',
    )
  return undefined
}
