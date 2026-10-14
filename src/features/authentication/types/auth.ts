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
