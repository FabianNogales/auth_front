import { create } from 'zustand'
import { queryClient } from '../../../app/providers/queryClient.ts'

import type { AuthenticationMethod } from '../../../shared/types/authentication.ts'
import type { LabUser } from '../types/auth.ts'
import type { OAuthTokenPair } from '../types/oauth.ts'

interface SessionState {
  mechanism: AuthenticationMethod | null
  /** Credenciales Basic en memoria (laboratorio: se reenvían por request). */
  basicEmail: string | null
  basicPassword: string | null
  apiKey: string | null
  jwtToken: string | null
  oauthToken: string | null
  oauthRefreshToken: string | null
  user: LabUser | null
  /**
   * Roles del usuario para mostrar/ocultar tabs. Solo UI: la autorización
   * real la decide el backend (AuthorizeAction). Vacío hasta que el
   * backend exponga roles del usuario actual.
   */
  roles: string[]
  loginBasic: (email: string, password: string, user: LabUser) => void
  loginJwt: (token: string, user: LabUser) => void
  setApiKey: (key: string) => void
  setJwtToken: (token: string) => void
  setOAuthToken: (token: string) => void
  rememberOAuthPair: (pair: OAuthTokenPair) => void
  clearOAuthTokens: () => void
  setRoles: (roles: string[]) => void
  logout: () => void
}

const initialSession: {
  mechanism: AuthenticationMethod | null
  basicEmail: string | null
  basicPassword: string | null
  apiKey: string | null
  jwtToken: string | null
  oauthToken: string | null
  oauthRefreshToken: string | null
  user: LabUser | null
  roles: string[]
} = {
  mechanism: null,
  basicEmail: null,
  basicPassword: null,
  apiKey: null,
  jwtToken: null,
  oauthToken: null,
  oauthRefreshToken: null,
  user: null,
  roles: [],
}

/**
 * Sesión del laboratorio: qué mecanismo está activo y con qué credencial.
 * Solo estado cliente; roles/permisos los decide el backend (AuthorizeAction).
 */
export const useSessionStore = create<SessionState>()((set) => ({
  ...initialSession,

  loginBasic: (email, password, user) =>
    set({
      ...initialSession,
      mechanism: 'BASIC',
      basicEmail: email,
      basicPassword: password,
      user,
    }),

  loginJwt: (token, user) =>
    set({
      ...initialSession,
      mechanism: 'JWT',
      jwtToken: token,
      user,
    }),

  setApiKey: (key) =>
    set((state) => ({ ...state, mechanism: 'API_KEY', apiKey: key })),

  setJwtToken: (token) =>
    set((state) => ({ ...state, mechanism: 'JWT', jwtToken: token })),

  setOAuthToken: (token) =>
    set((state) => ({ ...state, mechanism: 'OAUTH2', oauthToken: token })),

  // Credenciales del experimento en memoria; no cambia la identidad que abrió el laboratorio.
  rememberOAuthPair: (pair) => set({ oauthToken: pair.access_token, oauthRefreshToken: pair.refresh_token }),
  clearOAuthTokens: () => set({ oauthToken: null, oauthRefreshToken: null }),

  setRoles: (roles) => set({ roles: [...roles] }),

  logout: () => {
    set({ ...initialSession })
    queryClient.clear()
  },
}))
