import { beforeEach, expect, it, vi } from 'vitest'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { experimentService } from './experimentService.ts'
import { revocationComparisonService } from './revocationComparisonService.ts'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
vi.mock('../../../shared/services/httpClient.ts', () => ({
  httpClient: { get: vi.fn() },
}))
vi.mock('./experimentService.ts', () => ({
  experimentService: { list: vi.fn() },
}))
beforeEach(() => {
  vi.resetAllMocks()
  useSessionStore
    .getState()
    .loginBasic('admin@lab.test', 'fixture', {
      id: '1',
      name: 'Admin',
      email: 'admin@lab.test',
      is_active: true,
    })
})
it('reutiliza el listado autorizado y envía sesión administrativa al consultar eventos', async () => {
  vi.mocked(experimentService.list).mockResolvedValue([])
  expect(await revocationComparisonService.experiments()).toEqual([])
  expect(experimentService.list).toHaveBeenCalledOnce()
  vi.mocked(httpClient.get).mockResolvedValue({ data: [] })
  await revocationComparisonService.evidence({
    id: 7,
    name: 'Prueba',
    mechanism: 'oauth',
    status: 'COMPLETED',
  })
  expect(httpClient.get).toHaveBeenCalledWith('/experiments/7/events', {
    headers: { Authorization: `Basic ${btoa('admin@lab.test:fixture')}` },
  })
})
