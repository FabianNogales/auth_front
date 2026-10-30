import { toApiError } from '../../../shared/services/ApiError.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { sessionHeaders } from '../../authentication/services/sessionHeaders.ts'

export interface RoleChangeEvent {
  event_type: string
  created_at: string
  payload: { user_id?: number; added?: string[]; removed?: string[]; admin_id?: number | null; admin_name?: string | null }
  payload: after_metric_id?: number
}

export const experimentRoleService = {
  async change(experimentId: number, userId: string, newRole: string, currentRoles: string[]): Promise<void> {
    try {
      await httpClient.post(
        `/experiments/${experimentId}/privileges`,
        { user_id: Number(userId), add_roles: [newRole], remove_roles: currentRoles.filter((role) => role !== newRole) },
        { headers: sessionHeaders() },
      )
    } catch (error) {
      throw toApiError(error, 'No se pudo cambiar el rol')
    }
  },
  async history(experimentId: number): Promise<RoleChangeEvent[]> {
    try {
      const { data } = await httpClient.get<RoleChangeEvent[]>(`/experiments/${experimentId}/events`, { headers: sessionHeaders() })
      return data.filter((event) => event.event_type === 'role_change').reverse()
    } catch (error) {
      throw toApiError(error, 'No se pudo cargar el historial del experimento')
    }
  },
}