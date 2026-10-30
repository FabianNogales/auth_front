import { apiKeyHeaders, basicAuthHeaders, bearerHeaders } from '../../../shared/services/authHeaders.ts'
import { useSessionStore } from '../hooks/useSessionStore.ts'

/** Headers de gestión: nunca se usan como credenciales del usuario de prueba. */
export function sessionHeaders(): Record<string, string> {
  const session = useSessionStore.getState()
  switch (session.mechanism) {
    case 'BASIC':
      return session.basicEmail && session.basicPassword ? basicAuthHeaders(session.basicEmail, session.basicPassword) : {}
    case 'API_KEY':
      return session.apiKey ? apiKeyHeaders(session.apiKey) : {}
    case 'JWT':
      return session.jwtToken ? bearerHeaders(session.jwtToken, 'jwt') : {}
    case 'OAUTH2':
      return session.oauthToken ? bearerHeaders(session.oauthToken, 'oauth') : {}
    default:
      return {}
  }
}
