import { toApiError } from '../../../shared/services/ApiError.ts'
import { experimentHeaders } from '../../../shared/services/authHeaders.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import type { Experiment } from '../types/experiment.ts'
import { credentialHeaders, type ExperimentCredential } from './experimentExecution.ts'

export const experimentLiveService = {
  /** Una solicitud del usuario de prueba, registrada como métrica del experimento. */
  async sendTicketsRequest(experiment: Experiment, credential: ExperimentCredential): Promise<number> {
    try {
      const response = await httpClient.get('/tickets', {
        headers: { ...credentialHeaders(experiment.mechanism, credential), ...experimentHeaders(experiment.id) },
        validateStatus: (status) => status >= 200 && status < 500,
      })
      return response.status
    } catch (error) {
      throw toApiError(error, 'No se pudo enviar la solicitud de prueba')
    }
  },
}