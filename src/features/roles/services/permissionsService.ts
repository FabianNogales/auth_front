import { toApiError } from '../../../shared/services/ApiError.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import type { RolePermission } from '../types/role.ts'

export const permissionsService = {
  async getPermissions(): Promise<RolePermission[]> {
    try {
      return (await httpClient.get<RolePermission[]>('/permissions')).data
    } catch (error) {
      throw toApiError(error, 'No se pudieron cargar los permisos.')
    }
  },
}
