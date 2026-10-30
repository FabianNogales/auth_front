import { beforeEach, expect, it, vi } from 'vitest'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import { experimentRevocationService } from './experimentRevocationService.ts'
import type { Experiment } from '../types/experiment.ts'
vi.mock('../../../shared/services/httpClient.ts', () => ({
  httpClient: { post: vi.fn() },
}))
const experiment: Experiment = {
  id: 7,
  name: 'Prueba',
  mechanism: 'api_key',
  status: 'RUNNING',
  test_user_id: '42',
  resources: ['tickets.list'],
  created_at: null,
  started_at: null,
  finished_at: null,
}
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
it('identifica la API Key exacta antes de revocar con identidad administrativa', async () => {
  vi.mocked(httpClient.post)
    .mockResolvedValueOnce({ data: { user: { id: '42' }, key_id: 99 } })
    .mockResolvedValueOnce({ status: 204 })
  await experimentRevocationService.revoke(
    experiment,
    'key-experimental',
    new AbortController().signal,
  )
  expect(httpClient.post).toHaveBeenNthCalledWith(
    1,
    '/auth/api-key/login',
    { key: 'key-experimental' },
    expect.anything(),
  )
  expect(httpClient.post).toHaveBeenNthCalledWith(
    2,
    '/auth/api-key/revoke/99',
    undefined,
    expect.objectContaining({
      headers: {
        Authorization: `Basic ${btoa('admin@lab.test:fixture')}`,
        'X-Experiment-Id': '7',
      },
    }),
  )
})
it('no revoca una API Key de otro usuario', async () => {
  vi.mocked(httpClient.post).mockResolvedValueOnce({
    data: { user: { id: '999' }, key_id: 99 },
  })
  await expect(
    experimentRevocationService.revoke(
      experiment,
      'key-experimental',
      new AbortController().signal,
    ),
  ).rejects.toThrow('No se pudo identificar')
  expect(httpClient.post).toHaveBeenCalledOnce()
})
it('rechaza Basic y no realiza mutaciones', async () => {
  await expect(
    experimentRevocationService.revoke(
      { ...experiment, mechanism: 'basic' },
      'password',
      new AbortController().signal,
    ),
  ).rejects.toThrow('Basic no tiene')
  expect(httpClient.post).not.toHaveBeenCalled()
})

it('descarta el par OAuth revocado sin cambiar la sesión Basic administrativa', async () => {
  useSessionStore.getState().rememberOAuthPair({token_type:'Bearer',access_token:'test-access',refresh_token:'test-refresh',expires_in:3600})
  vi.mocked(httpClient.post).mockResolvedValueOnce({status:204})
  await experimentRevocationService.revoke({...experiment,mechanism:'oauth'},'test-access',new AbortController().signal)
  expect(useSessionStore.getState().oauthToken).toBeNull()
  expect(useSessionStore.getState().oauthRefreshToken).toBeNull()
  expect(useSessionStore.getState().mechanism).toBe('BASIC')
})
