import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  basicAuthHeaders,
  apiKeyHeaders,
  bearerHeaders,
} from '../../../shared/services/authHeaders.ts'
import { apiKeyService } from '../services/apiKeyService.ts'
import type { IssueApiKeyInput } from '../types/apiKey.ts'
import { useSessionStore } from './useSessionStore.ts'

export function useApiKeys(userId: number | null) {
  const session = useSessionStore()
  const client = useQueryClient()
  let headers: Record<string, string> = {}
  if (
    session.mechanism === 'BASIC' &&
    session.basicEmail &&
    session.basicPassword
  ) {
    headers = basicAuthHeaders(session.basicEmail, session.basicPassword)
  } else if (session.mechanism === 'API_KEY' && session.apiKey) {
    headers = apiKeyHeaders(session.apiKey)
  } else if (session.mechanism === 'JWT' && session.jwtToken) {
    headers = bearerHeaders(session.jwtToken, 'jwt')
  } else if (session.mechanism === 'OAUTH2' && session.oauthToken) {
    headers = bearerHeaders(session.oauthToken, 'oauth')
  }
  const scope = [session.user?.id, session.mechanism]
  const users = useQuery({
    queryKey: ['api-key-users', ...scope],
    queryFn: () => apiKeyService.users(headers),
    enabled: session.user !== null,
  })
  const keys = useQuery({
    queryKey: ['api-keys', ...scope, userId],
    queryFn: () => apiKeyService.list(userId!, headers),
    enabled: userId !== null && session.user !== null,
    retry: false,
  })
  const refresh = (id: number) =>
    client.invalidateQueries({ queryKey: ['api-keys', ...scope, id] })
  // El secreto nunca pasa por useMutation: no debe quedar en MutationCache.
  const issue = (input: IssueApiKeyInput) => apiKeyService.issue(input, headers)
  const revoke = useMutation({
    mutationFn: (id: number) => apiKeyService.revoke(id, headers),
    onSuccess: () => {
      toast.success('API Key revocada correctamente')
      if (userId !== null) void refresh(userId)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      if (userId !== null) void refresh(userId)
    },
  })
  return { users, keys, issue, refresh, revoke }
}
