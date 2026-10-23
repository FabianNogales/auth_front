import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, expect, it, vi } from 'vitest'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { oauthService } from './oauthService.ts'

vi.mock('../../../shared/services/httpClient.ts', () => ({
  httpClient: { get: vi.fn(), post: vi.fn() },
}))
function failure(status: number, data: unknown) {
  return new AxiosError('fallo', undefined, undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  })
}
beforeEach(() => vi.resetAllMocks())
it('envía Bearer y discriminador OAuth al recurso protegido', async () => {
  vi.mocked(httpClient.get).mockResolvedValue({ data: [{ id: 1 }] })
  await expect(oauthService.protectedRequest(' token ')).resolves.toEqual([
    { id: 1 },
  ])
  expect(httpClient.get).toHaveBeenCalledWith('/tickets', {
    headers: { Authorization: 'Bearer token', 'X-Auth-Mechanism': 'oauth' },
  })
})
it.each([401, 403])(
  'distingue el rechazo %s sin conservar credenciales Axios',
  async (status) => {
    vi.mocked(httpClient.get).mockRejectedValue(
      failure(status, { error: 'unauthenticated' }),
    )
    const rejected = oauthService.protectedRequest('token')
    await expect(rejected).rejects.toMatchObject({
      status,
      message:
        status === 401
          ? 'No autenticado'
          : 'No tienes permisos para acceder a este recurso',
    })
    await expect(rejected).rejects.not.toHaveProperty('cause')
  },
)
it.each([
  ['expired_token', 'El token de renovación ha expirado'],
  ['revoked_token', 'El token de renovación ha sido revocado'],
  [undefined, 'El token de renovación no es válido'],
])(
  'interpreta la causa de renovación %s manteniendo invalid_grant',
  async (reason, message) => {
    vi.mocked(httpClient.post).mockRejectedValue(
      failure(400, { error: 'invalid_grant', reason }),
    )
    await expect(oauthService.refreshToken('refresh')).rejects.toMatchObject({
      status: 400,
      message,
    })
  },
)
it('renueva sin reenviar contraseña ni datos del cliente', async () => {
  const pair = {
    token_type: 'Bearer',
    access_token: 'nuevo',
    refresh_token: 'refresh-nuevo',
    expires_in: 3600,
  }
  vi.mocked(httpClient.post).mockResolvedValue({ data: pair })
  await expect(
    oauthService.refreshToken(' refresh-anterior '),
  ).resolves.toEqual(pair)
  expect(httpClient.post).toHaveBeenCalledWith('/auth/oauth/refresh', {
    refresh_token: 'refresh-anterior',
  })
})
