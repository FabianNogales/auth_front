import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import type { BasicCredentials } from '../../authentication/types/auth.ts'

/** Credenciales Basic de la sesión activa (null si no hay sesión). */
export function useBasicCredentials(): BasicCredentials | null {
  const email = useSessionStore((state) => state.basicEmail)
  const password = useSessionStore((state) => state.basicPassword)

  return email !== null && password !== null ? { email, password } : null
}