import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import { apiKeyHeaders, basicAuthHeaders, bearerHeaders, experimentHeaders } from '../../../shared/services/authHeaders.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import type { LabUser } from '../../authentication/types/auth.ts'
import { metricsService } from '../../metrics/index.ts'
import type { Experiment, ExperimentMechanism } from '../types/experiment.ts'
import { experimentService } from './experimentService.ts'

export interface ExperimentCredential { email: string; secret: string }

export function credentialHeaders(mechanism: ExperimentMechanism, credential: ExperimentCredential): Record<string, string> {
  switch (mechanism) {
    case 'basic': return basicAuthHeaders(credential.email.trim(), credential.secret)
    case 'api_key': return apiKeyHeaders(credential.secret.trim())
    case 'jwt': return bearerHeaders(credential.secret.trim(), 'jwt')
    case 'oauth': return bearerHeaders(credential.secret.trim(), 'oauth')
  }
}

export function invalidCredentialHeaders(mechanism: ExperimentMechanism, credential: ExperimentCredential): Record<string, string> {
  if (mechanism === 'basic') return basicAuthHeaders(credential.email.trim(), `${credential.secret}:${crypto.getRandomValues(new Uint32Array(4)).join('-')}`)
  if (mechanism === 'jwt') {
    const parts = credential.secret.trim().split('.')
    if (parts.length !== 3 || !parts[2]) throw new ApiError('El JWT no tiene un formato válido')
    parts[2] = (parts[2][0] === 'A' ? 'B' : 'A') + parts[2].slice(1)
    return bearerHeaders(parts.join('.'), 'jwt')
  }
  const invalid = `${credential.secret.trim()}.invalid`
  return mechanism === 'api_key' ? apiKeyHeaders(invalid) : bearerHeaders(invalid, 'oauth')
}

function ensureActive(signal: AbortSignal): void {
  if (signal.aborted) throw new ApiError('La ejecución fue interrumpida')
}

async function verifyUser(experiment: Experiment, credential: ExperimentCredential, signal: AbortSignal): Promise<void> {
  try {
    // Sin X-Experiment-Id: la preparación no pertenece a las dos observaciones.
    const { data } = await httpClient.get<{ user: LabUser }>('/users/me', { headers: credentialHeaders(experiment.mechanism, credential), signal })
    if (String(data.user.id) !== experiment.test_user_id) throw new ApiError('La credencial no pertenece al usuario de prueba seleccionado', { status: 422 })
  } catch (error) {
    if (error instanceof ApiError) throw error
    const converted = toApiError(error, 'No se pudo verificar la credencial del usuario de prueba')
    throw new ApiError(converted.isUnauthorized ? 'La credencial del usuario de prueba no es válida' : 'No se pudo verificar la credencial del usuario de prueba', { status: converted.status, code: converted.code })
  }
}

async function requestTickets(id: number, headers: Record<string, string>, signal: AbortSignal): Promise<number> {
  try {
    const response = await httpClient.get('/tickets', {
      headers: { ...headers, ...experimentHeaders(id) }, signal,
      validateStatus: (status) => status >= 200 && status < 500,
    })
    return response.status
  } catch (error) {
    const converted = toApiError(error, 'Falló una solicitud experimental')
    throw new ApiError('Falló una solicitud experimental; las métricas registradas se conservan', { status: converted.status, code: converted.code })
  }
}

/** Coordinación HTTP en el navegador, sin reintentos automáticos ni secretos en Query. */
export async function executeExperiment(experiment: Experiment, credential: ExperimentCredential, options: {
  signal: AbortSignal
  onStarted: (experiment: Experiment) => void
  onProgress: (message: string) => void
}) {
  let started = false
  try {
    if (experiment.test_user_id === null || experiment.resources?.length !== 1 || experiment.resources[0] !== 'tickets.list') {
      throw new ApiError('Este experimento no tiene la configuración permitida de usuario y recursos')
    }
    ensureActive(options.signal)
    options.onProgress('Verificando la credencial del usuario de prueba…')
    await verifyUser(experiment, credential, options.signal)
    // Preparar también el caso negativo antes de reservar el experimento.
    const invalidHeaders = invalidCredentialHeaders(experiment.mechanism, credential)
    ensureActive(options.signal)
    const running = await experimentService.start(experiment.id)
    started = true
    options.onStarted(running)
    ensureActive(options.signal)
    options.onProgress('En ejecución · solicitud 1 de 2')
    const validStatus = await requestTickets(experiment.id, credentialHeaders(experiment.mechanism, credential), options.signal)
    if (!(validStatus >= 200 && validStatus < 300) && validStatus !== 403) {
      throw new ApiError(`La solicitud con credencial válida devolvió HTTP ${validStatus}; la ejecución no se completó`)
    }
    ensureActive(options.signal)
    options.onProgress('En ejecución · solicitud 2 de 2')
    const invalidStatus = await requestTickets(experiment.id, invalidHeaders, options.signal)
    if (invalidStatus !== 401) throw new ApiError(`La prueba negativa devolvió HTTP ${invalidStatus}; se esperaba HTTP 401`)
    ensureActive(options.signal)
    options.onProgress('Consultando las métricas registradas…')
    const results = await metricsService.get(experiment.id, options.signal)
    ensureActive(options.signal)
    const completed = await experimentService.finish(experiment.id)
    return { experiment: completed, ...results }
  } catch (error) {
    let message = error instanceof ApiError ? error.message : 'Ocurrió un fallo operativo durante la ejecución'
    if (started) {
      try {
        await experimentService.finish(experiment.id, 'FAILED')
      } catch {
        message += '. No se pudo confirmar el cierre; actualiza el listado para comprobar el estado'
      }
    }
    // No propagar causes, respuestas ni headers de Axios.
    throw new ApiError(message, error instanceof ApiError ? { status: error.status, code: error.code } : {})
  } finally {
    credential.email = ''
    credential.secret = ''
  }
}
