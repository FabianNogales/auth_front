import type { AuthenticationMethod } from '../../../shared/types/authentication.ts'

/** Usuario del laboratorio tal como lo devuelve el backend. */
export interface LabUser {
  id: string
  name: string
  email: string
  is_active: boolean
}

export interface BasicCredentials {
  email: string
  password: string
}

export interface BasicLoginResponse {
  user: LabUser
  mechanism: AuthenticationMethod | string
}

/** Credenciales para login JWT (email + password). */
export interface JwtCredentials {
  email: string
  password: string
}

/** Respuesta del login JWT. */
export interface JwtLoginResponse {
  user: LabUser
  mechanism: AuthenticationMethod | string
  token: string
  expires_at: string
}

/** Respuesta del refresh JWT. */
export interface JwtRefreshResponse {
  token: string
  expires_at: string
}
