import type { AUTHENTICATION_METHODS } from '../constants/authentication.ts'

export type AuthenticationMethod = (typeof AUTHENTICATION_METHODS)[number]
