export interface OAuthCredentials {
  username: string
  password: string
  client_id: string
  client_secret: string
}

export interface OAuthTokenPair {
  token_type: string
  access_token: string
  refresh_token: string
  expires_in: number
}
