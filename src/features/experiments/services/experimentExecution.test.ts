import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/services/ApiError.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { metricsService } from '../../metrics/index.ts'
import type { Experiment } from '../types/experiment.ts'
import { experimentService } from './experimentService.ts'
import { executeExperiment, invalidCredentialHeaders } from './experimentExecution.ts'

vi.mock('../../../shared/services/httpClient.ts', () => ({ httpClient: { get: vi.fn() } }))
vi.mock('./experimentService.ts', () => ({ experimentService: { start: vi.fn(), finish: vi.fn() } }))
vi.mock('../../metrics/index.ts', () => ({ metricsService: { get: vi.fn() } }))

const experiment: Experiment = { id: 7, name: 'Prueba', mechanism: 'oauth', status: 'PENDING', test_user_id: '42', resources: ['tickets.list'], created_at: '2026-10-30T12:00:00Z', started_at: null, finished_at: null }
const options = () => ({ signal: new AbortController().signal, onStarted: vi.fn(), onProgress: vi.fn() })
const results = { metrics: [{ mechanism: 'oauth', operation: 'GET api/tickets', http_status: 403, latency_ms: 10, auth_ms: 2, credential_size: 70, failed_layer: 'rbac' }], comparison: { rows: [], losses: 1, valid: false } }

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(experimentService.start).mockResolvedValue({ ...experiment, status: 'RUNNING' })
  vi.mocked(experimentService.finish).mockResolvedValue({ ...experiment, status: 'COMPLETED' })
  vi.mocked(metricsService.get).mockResolvedValue(results)
})

it('verifica el sujeto, ejecuta dos requests secuenciales y acepta el 403 real y el 401 esperado', async () => {
  vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { user: { id: '42' } } }).mockResolvedValueOnce({ status: 403 }).mockResolvedValueOnce({ status: 401 })
  const credential = { email: '', secret: 'access-original' }
  const result = await executeExperiment(experiment, credential, options())
  expect(vi.mocked(httpClient.get).mock.calls.map(([path]) => path)).toEqual(['/users/me', '/tickets', '/tickets'])
  expect(vi.mocked(experimentService.start).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(httpClient.get).mock.invocationCallOrder[1])
  expect(httpClient.get).toHaveBeenNthCalledWith(1, '/users/me', expect.objectContaining({ headers: { Authorization: 'Bearer access-original', 'X-Auth-Mechanism': 'oauth' } }))
  expect(httpClient.get).toHaveBeenNthCalledWith(2, '/tickets', expect.objectContaining({ headers: { Authorization: 'Bearer access-original', 'X-Auth-Mechanism': 'oauth', 'X-Experiment-Id': '7' } }))
  expect(httpClient.get).toHaveBeenNthCalledWith(3, '/tickets', expect.objectContaining({ headers: { Authorization: 'Bearer access-original.invalid', 'X-Auth-Mechanism': 'oauth', 'X-Experiment-Id': '7' } }))
  expect(experimentService.start).toHaveBeenCalledOnce()
  expect(experimentService.finish).toHaveBeenCalledExactlyOnceWith(7)
  expect(result.metrics).toEqual(results.metrics)
  expect(credential.secret).toBe('')
})

it('no inicia cuando la credencial corresponde a otro usuario', async () => {
  vi.mocked(httpClient.get).mockResolvedValue({ data: { user: { id: '99' } } })
  await expect(executeExperiment(experiment, { email: '', secret: 'original' }, options())).rejects.toThrow('La credencial no pertenece al usuario de prueba seleccionado')
  expect(experimentService.start).not.toHaveBeenCalled()
  expect(experimentService.finish).not.toHaveBeenCalled()
  expect(httpClient.get).toHaveBeenCalledOnce()
})

it('no envía solicitudes experimentales si start rechaza un segundo inicio', async () => {
  vi.mocked(httpClient.get).mockResolvedValue({ data: { user: { id: '42' } } })
  vi.mocked(experimentService.start).mockRejectedValue(new ApiError('Este experimento ya fue ejecutado', { status: 409 }))
  await expect(executeExperiment(experiment, { email: '', secret: 'original' }, options())).rejects.toThrow('Este experimento ya fue ejecutado')
  expect(httpClient.get).toHaveBeenCalledOnce()
  expect(experimentService.finish).not.toHaveBeenCalled()
})

it('cierra FAILED ante una caída de red y descarta el error Axios sensible', async () => {
  vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { user: { id: '42' } } }).mockRejectedValueOnce(new AxiosError('secret-value', 'ERR_NETWORK', { headers: new AxiosHeaders({ Authorization: 'Bearer secret-value' }) }))
  const credential = { email: '', secret: 'original' }
  const failure = executeExperiment(experiment, credential, options())
  await expect(failure).rejects.toThrow('Falló una solicitud experimental')
  await expect(failure).rejects.not.toHaveProperty('cause')
  expect(experimentService.finish).toHaveBeenCalledExactlyOnceWith(7, 'FAILED')
  expect(credential.secret).toBe('')
})

it('no completa si la prueba negativa no devuelve 401 y conserva el error de cierre', async () => {
  vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { user: { id: '42' } } }).mockResolvedValueOnce({ status: 200 }).mockResolvedValueOnce({ status: 403 })
  vi.mocked(experimentService.finish).mockRejectedValue(new ApiError('sin conexión'))
  await expect(executeExperiment(experiment, { email: '', secret: 'original' }, options())).rejects.toThrow('No se pudo confirmar el cierre')
  expect(experimentService.finish).toHaveBeenCalledExactlyOnceWith(7, 'FAILED')
})

it.each(['basic', 'api_key', 'jwt', 'oauth'] as const)('la credencial negativa conserva la rama %s sin alterar el original', (mechanism) => {
  const credential = { email: 'subject@lab.test', secret: mechanism === 'jwt' ? 'header.payload.signature' : 'original' }
  const original = { ...credential }
  const headers = invalidCredentialHeaders(mechanism, credential)
  expect(credential).toEqual(original)
  if (mechanism === 'basic') expect(headers.Authorization).toMatch(/^Basic /)
  if (mechanism === 'api_key') expect(headers['X-API-Key']).toBe('original.invalid')
  if (mechanism === 'jwt' || mechanism === 'oauth') expect(headers['X-Auth-Mechanism']).toBe(mechanism)
})
