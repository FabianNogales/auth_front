import { httpClient } from '../../../shared/services/httpClient.ts'
import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import type { LabUser } from '../types/auth.ts'
import type { ApiKey, IssuedApiKey, IssueApiKeyInput } from '../types/apiKey.ts'

export const apiKeyService = {
  async users(headers: Record<string, string>): Promise<LabUser[]> {
    try {
      return (await httpClient.get<LabUser[]>('/users', { headers })).data
    } catch (error) {
      throw toApiError(error, 'No se pudieron cargar los usuarios.')
    }
  },
  async list(
    userId: number,
    headers: Record<string, string>,
  ): Promise<ApiKey[]> {
    try {
      return (
        await httpClient.get<ApiKey[]>(`/auth/api-key/users/${userId}/keys`, {
          headers,
        })
      ).data
    } catch (error) {
      throw toApiError(error, 'No se pudieron cargar las API Keys.')
    }
  },
  async issue(
    input: IssueApiKeyInput,
    headers: Record<string, string>,
  ): Promise<IssuedApiKey> {
    try {
      return (
        await httpClient.post<IssuedApiKey>('/auth/api-key/issue', input, {
          headers,
        })
      ).data
    } catch (error) {
      const apiError = toApiError(error, 'No se pudo emitir la API Key.')
      if (
        apiError.isValidation &&
        apiError.errors &&
        typeof apiError.errors === 'object'
      ) {
        const message = Object.values(apiError.errors)
          .flat()
          .find((value) => typeof value === 'string')
        if (typeof message === 'string')
          throw new ApiError(message, { status: 422, errors: apiError.errors })
      }
      throw apiError
    }
  },
  async revoke(id: number, headers: Record<string, string>): Promise<void> {
    try {
      await httpClient.post(`/auth/api-key/revoke/${id}`, undefined, {
        headers,
      })
    } catch (error) {
      throw toApiError(error, 'No se pudo revocar la API Key.')
    }
  },

  async getProtectedResource<T>(path: string, apiKey: string): Promise<T> {
    try {
      const response = await httpClient.get<T>(path, {
        headers: {
          'X-API-Key': apiKey.trim(),
        },
      })
      return response.data
    } catch (error) {
      throw toApiError(error, 'No autenticado')
    }
  },

  async testProtected(apiKey: string): Promise<unknown> {
    return apiKeyService.getProtectedResource('/auth/api-key/protected-resource', apiKey)
  },
}
