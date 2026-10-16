export interface ApiKey {
  id: number
  user_id: number
  label: string | null
  created_at: string | null
  expires_at: string | null
  revoked_at: string | null
}

export interface IssueApiKeyInput {
  user_id: number
  label: string
  expires_at: string | null
}

export interface IssuedApiKey {
  key: ApiKey
  plain: string
}

export function apiKeyStatus(key: ApiKey): 'Activa' | 'Revocada' | 'Expirada' {
  if (key.revoked_at !== null) return 'Revocada'
  if (key.expires_at !== null && Date.parse(key.expires_at) <= Date.now())
    return 'Expirada'
  return 'Activa'
}
