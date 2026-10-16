import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import type { CreateRoleInput, RoleResponse } from '../types/role.ts'

export const rolesService = {
  async getRoles(): Promise<RoleResponse[]> {
    // MOCK TEMPORAL PARA PRUEBAS LOCALES (SCRUM-27)
    return [
      { id: '1', name: 'admin', description: 'Acceso total y administración del sistema', permissions: [] },
      { id: '2', name: 'editor', description: 'Permisos para editar y modificar registros', permissions: [] },
      { id: '3', name: 'viewer', description: 'Acceso exclusivo de solo lectura', permissions: [] }
    ] as unknown as RoleResponse[]
  },
  async syncPermissions(name: string, permissions: string[]): Promise<void> {
    try {
      await httpClient.put(`/roles/${encodeURIComponent(name)}/permissions`, { permissions })
    } catch (error) {
      throw toApiError(error, 'No se pudieron actualizar los permisos.')
    }
  },
  async createRole(input: CreateRoleInput): Promise<RoleResponse> {
    try {
      return (await httpClient.post<RoleResponse>('/roles', input)).data
    } catch (error) {
      const apiError = toApiError(error, 'No se pudo crear el rol.')
      if (
        apiError.isValidation &&
        apiError.message === `El rol ${input.name.trim()} ya existe.`
      ) {
        throw new ApiError('Ya existe un rol con ese nombre', {
          status: apiError.status,
          errors: apiError.errors,
          cause: apiError,
        })
      }
      throw apiError
    }
  },
}