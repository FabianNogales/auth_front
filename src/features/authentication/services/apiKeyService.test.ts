import { expect, it, vi } from 'vitest'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { apiKeyService } from './apiKeyService.ts'

vi.mock('../../../shared/services/httpClient.ts', () => ({
  httpClient: { get: vi.fn() },
}))

it('permite al hook consultar un recurso protegido con la API Key explícita', async () => {
  vi.mocked(httpClient.get).mockResolvedValueOnce({ data: [{ id: 1 }] })
  expect(await apiKeyService.getProtectedResource('/tickets', ' clave-demo ')).toEqual([{ id: 1 }])
  expect(httpClient.get).toHaveBeenLastCalledWith('/tickets', {
    headers: { 'X-API-Key': 'clave-demo' },
  })
})

it('conserva el endpoint de la prueba de autenticación existente', async () => {
  vi.mocked(httpClient.get).mockResolvedValueOnce({ data: { message: 'OK' } })
  expect(await apiKeyService.testProtected('clave-demo')).toEqual({ message: 'OK' })
  expect(httpClient.get).toHaveBeenLastCalledWith('/auth/api-key/protected-resource', {
    headers: { 'X-API-Key': 'clave-demo' },
  })
})
