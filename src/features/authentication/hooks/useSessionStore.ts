import { create } from 'zustand'

import type { AuthenticationMethod } from '../../../shared/types/authentication.ts'
import type { LabUser } from '../types/auth.ts'

interface SessionState {
  mechanism: AuthenticationMethod | null
  /** Credenciales Basic en memoria (laboratorio: se reenvían por request). */
  basicEmail: string | null
  basicPassword: string | null
  apiKey: string | null
  jwtToken: string | null
  oauthToken: string | null
  user: LabUser | null
  /**
   * Roles del usuario para mostrar/ocultar tabs. Solo UI: la autorización
   * real la decide el backend (AuthorizeAction). Vacío hasta que el
   * backend exponga roles del usuario actual.
   */
  roles: string[]
  loginBasic: (email: string, password: string, user: LabUser) => void
  setApiKey: (key: string) => void
  setJwtToken: (token: string) => void
  setOAuthToken: (token: string) => void
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
  user: LabUser | null
  roles: string[]
} = {
  mechanism: null,
  basicEmail: null,
  basicPassword: null,
  apiKey: null,
  jwtToken: null,
  oauthToken: null,
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

  setApiKey: (key) =>
    set((state) => ({ ...state, mechanism: 'API_KEY', apiKey: key })),

  setJwtToken: (token) =>
    set((state) => ({ ...state, mechanism: 'JWT', jwtToken: token })),

  setOAuthToken: (token) =>
    set((state) => ({ ...state, mechanism: 'OAUTH2', oauthToken: token })),

  setRoles: (roles) => set({ roles: [...roles] }),

  logout: () => set({ ...initialSession }),
}))
