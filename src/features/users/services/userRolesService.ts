import { httpClient } from '../../../shared/services/httpClient.ts'
import { basicAuthHeaders } from '../../../shared/services/authHeaders.ts'
import { toApiError } from '../../../shared/services/ApiError.ts'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import type { LabUser } from '../../authentication/types/auth.ts'
import type { UserWithRoles } from '../types/userRoles.ts'

// Helper interno para adjuntar las credenciales del store sin alterar las firmas de las funciones
function getAuthHeaders() {
  const { mechanism, basicEmail, basicPassword } = useSessionStore.getState()
  if (mechanism === 'BASIC' && basicEmail && basicPassword) {
    return basicAuthHeaders(basicEmail, basicPassword)
  }
  return {}
}

export const userRolesService = {
  async getUsers(): Promise<LabUser[]> {
    try {
      const { data } = await httpClient.get<LabUser[]>('/users', {
        headers: getAuthHeaders(),
      })
      return data
    } catch (error) {
      throw toApiError(error, 'No se pudieron cargar los usuarios.')
    }
  },
  async getUser(id: string): Promise<UserWithRoles> {
    try {
      const { data } = await httpClient.get<UserWithRoles>(`/users/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders(),
      })
      return data
    } catch (error) {
      throw toApiError(error, 'No se pudo cargar el usuario.')
    }
  },
  async assign(id: string, role: string): Promise<void> {
    try {
      await httpClient.post(
        `/users/${encodeURIComponent(id)}/roles`,
        { role },
        {
          headers: getAuthHeaders(),
        },
      )
    } catch (error) {
      throw toApiError(error, 'No se pudo asignar el rol.')
    }
  },
  async revoke(id: string, role: string): Promise<void> {
    try {
      await httpClient.delete(
        `/users/${encodeURIComponent(id)}/roles/${encodeURIComponent(role)}`,
        {
          headers: getAuthHeaders(),
        },
      )
    } catch (error) {
      throw toApiError(error, 'No se pudo revocar el rol.')
    }
  },
}