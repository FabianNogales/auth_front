import { isAxiosError } from 'axios'
import { ApiError } from '../../../shared/services/ApiError.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { experimentHeaders } from '../../../shared/services/authHeaders.ts'
import { sessionHeaders } from '../../authentication/services/sessionHeaders.ts'
import type { Experiment } from '../types/experiment.ts'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'

export const experimentRevocationService = {
  async revoke(
    experiment: Experiment,
    secret: string,
    signal: AbortSignal,
  ): Promise<void> {
    if (experiment.mechanism === 'basic')
      throw new ApiError(
        'Basic no tiene una credencial de tipo token que pueda revocarse',
      )
    const headers = { ...sessionHeaders(), ...experimentHeaders(experiment.id) }
    try {
      let url = `/auth/${experiment.mechanism}/revoke`
      let body: { token: string } | undefined = { token: secret.trim() }
      if (experiment.mechanism === 'api_key') {
        const { data } = await httpClient.post<{
          user: { id: string }
          key_id: number
        }>('/auth/api-key/login', { key: secret.trim() }, { signal })
        if (
          String(data.user.id) !== experiment.test_user_id ||
          !Number.isSafeInteger(data.key_id) ||
          data.key_id < 1
        )
          throw new ApiError(
            'No se pudo identificar la API Key del usuario de prueba',
          )
        url = `/auth/api-key/revoke/${data.key_id}`
        body = undefined
      }
      const response = await httpClient.post(url, body, { headers, signal })
      if (response.status !== 204)
        throw new ApiError(
          'No se confirmó la revocación de la credencial de prueba',
        )
      const session = useSessionStore.getState()
      if (experiment.mechanism === 'oauth' && session.oauthToken === secret.trim()) {
        session.clearOAuthTokens()
      }
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error
      const status = isAxiosError(error) ? error.response?.status : undefined
      throw new ApiError(
        'No se pudo confirmar la revocación; consulta los eventos antes de repetir la prueba',
        { status },
      )
    }
  },
}
