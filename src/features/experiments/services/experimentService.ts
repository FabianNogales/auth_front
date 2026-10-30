import { isAxiosError } from 'axios'
import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { sessionHeaders } from '../../authentication/services/sessionHeaders.ts'
import type { CreateExperimentInput, Experiment } from '../types/experiment.ts'

const conflictMessages: Record<string, string> = {
  experiment_already_executed: 'Este experimento ya fue ejecutado',
  experiment_running: 'Este experimento ya está en ejecución',
  experiment_failed: 'Un experimento fallido no puede volver a iniciarse',
  experiment_not_running: 'Solo se puede finalizar un experimento en ejecución',
  experiment_state_changed: 'El experimento cambió de estado; actualice el listado',
}

function operationError(error: unknown, fallback: string): ApiError {
  const converted = toApiError(error, fallback)
  const data: unknown = isAxiosError<unknown>(error) ? error.response?.data : undefined
  const code = typeof data === 'object' && data !== null && 'error' in data ? data.error : undefined
  const message = typeof code === 'string' && conflictMessages[code]
    ? conflictMessages[code]
    : converted.isNotFound ? 'Experimento no encontrado'
      : converted.isUnauthorized ? 'La sesión administrativa no es válida'
        : converted.isForbidden ? 'No tienes permiso para gestionar experimentos'
          : converted.isValidation ? 'Revisa los datos del experimento'
            : converted.isNetworkError || converted.isTimeout ? converted.message : fallback
  // No retener AxiosError/config: sus headers contienen la credencial administrativa.
  return new ApiError(message, { status: converted.status, code: converted.code, errors: converted.isValidation ? converted.errors : undefined })
}

export const experimentService = {
  async list(): Promise<Experiment[]> {
    try {
      return (await httpClient.get<Experiment[]>('/experiments', { headers: sessionHeaders() })).data
    } catch (error) {
      throw operationError(error, 'No se pudieron cargar los experimentos')
    }
  },
  async create(input: CreateExperimentInput): Promise<Experiment> {
    try {
      const response = await httpClient.post<Experiment>('/experiments', input, { headers: sessionHeaders() })
      if (response.status !== 201) throw new ApiError('Respuesta inesperada al crear el experimento')
      return response.data
    } catch (error) {
      throw operationError(error, 'No se pudo crear el experimento')
    }
  },
  async start(id: number): Promise<Experiment> {
    try {
      return (await httpClient.post<Experiment>(`/experiments/${id}/start`, undefined, { headers: sessionHeaders() })).data
    } catch (error) {
      throw operationError(error, 'No se pudo iniciar el experimento; actualiza el listado para comprobar su estado')
    }
  },
  async finish(id: number, status: 'COMPLETED' | 'FAILED' = 'COMPLETED'): Promise<Experiment> {
    try {
      return (await httpClient.post<Experiment>(`/experiments/${id}/finish`, { status }, { headers: sessionHeaders() })).data
    } catch (error) {
      throw operationError(error, 'No se pudo confirmar el cierre del experimento; actualiza el listado')
    }
  },
}
