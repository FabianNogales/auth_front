import { httpClient } from '../../../shared/services/httpClient.ts'
import { toApiError } from '../../../shared/services/ApiError.ts'
import type { LabUser } from '../../authentication/types/auth.ts'
import type { UserWithRoles } from '../types/userRoles.ts'

export const userRolesService = {
  async getUsers(): Promise<LabUser[]> {
    // MOCK TEMPORAL PARA PRUEBAS LOCALES (SCRUM-26)
    return [
      { id: '1', name: 'Administrador Lab', email: 'admin@lab.test', roles: ['admin'] },
      { id: '2', name: 'Editor Contenido', email: 'editor@lab.test', roles: ['editor'] },
      { id: '3', name: 'Usuario Lectura', email: 'viewer@lab.test', roles: ['viewer'] }
    ] as unknown as LabUser[]
  },
  async getUser(id: string): Promise<UserWithRoles> {
    try {
      return (await httpClient.get<UserWithRoles>(`/users/${encodeURIComponent(id)}`)).data
    } catch (error) {
      throw toApiError(error, 'No se pudo cargar el usuario.')
    }
  },
  async assign(id: string, role: string): Promise<void> {
    try {
      await httpClient.post(`/users/${encodeURIComponent(id)}/roles`, { role })
    } catch (error) {
      throw toApiError(error, 'No se pudo asignar el rol.')
    }
  },
  async revoke(id: string, role: string): Promise<void> {
    try {
      await httpClient.delete(`/users/${encodeURIComponent(id)}/roles/${encodeURIComponent(role)}`)
    } catch (error) {
      throw toApiError(error, 'No se pudo revocar el rol.')
    }
  },
}