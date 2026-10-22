import { AxiosError, AxiosHeaders } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../../../shared/services/httpClient.ts'
import { oauthService } from './oauthService.ts'

vi.mock('../../../shared/services/httpClient.ts', () => ({ httpClient: { post: vi.fn() } }))

const credentials = {
  username: 'admin@lab.test', password: 'password', client_id: 'lab-client', client_secret: 'secret',
}
const pair = { token_type: 'Bearer', access_token: 'access', refresh_token: 'refresh', expires_in: 3600 }

function httpError(status: number, data: unknown): AxiosError {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status, data, statusText: '', headers: {}, config: { headers: new AxiosHeaders() },
  })
}

describe('oauthService', () => {
  beforeEach(() => vi.resetAllMocks())

  it('envía username y grant password y devuelve el par completo', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ data: pair })
    await expect(oauthService.issueToken(credentials)).resolves.toEqual(pair)
    expect(httpClient.post).toHaveBeenCalledWith('/auth/oauth/token', { ...credentials, grant_type: 'password' })
  })

  it('mapea solo invalid_grant 400 a No autorizado y descarta el error Axios original', async () => {
    vi.mocked(httpClient.post).mockRejectedValue(httpError(400, { error: 'invalid_grant' }))
    await expect(oauthService.issueToken(credentials)).rejects.toMatchObject({ message: 'No autorizado', status: 400 })
    await expect(oauthService.issueToken(credentials)).rejects.not.toHaveProperty('cause')
    vi.mocked(httpClient.post).mockRejectedValue(httpError(400, { error: 'unsupported_grant_type' }))
    await expect(oauthService.issueToken(credentials)).rejects.toHaveProperty('message', 'No se pudo obtener el token OAuth')
  })

  it('conserva errores 422 para el formulario', async () => {
    const errors = { username: ['Correo inválido'] }
    vi.mocked(httpClient.post).mockRejectedValue(httpError(422, { errors, message: 'Revisa los campos' }))
    await expect(oauthService.issueToken(credentials)).rejects.toMatchObject({ status: 422, errors })
  })

  it('revoca usando el token original y distingue el código exacto 409', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ status: 204 })
    await expect(oauthService.revokeToken('original')).resolves.toBe('revoked')
    expect(httpClient.post).toHaveBeenCalledWith('/auth/oauth/revoke', { token: 'original' })
    vi.mocked(httpClient.post).mockRejectedValue(httpError(409, { error: 'token_already_revoked' }))
    await expect(oauthService.revokeToken('original')).resolves.toBe('already_revoked')
    vi.mocked(httpClient.post).mockRejectedValue(httpError(409, { error: 'otro_conflicto' }))
    await expect(oauthService.revokeToken('original')).rejects.toHaveProperty('status', 409)
  })

  it('no confunde token desconocido con token ya revocado', async () => {
    vi.mocked(httpClient.post).mockRejectedValue(httpError(400, { error: 'invalid_grant' }))
    await expect(oauthService.revokeToken('desconocido')).rejects.toHaveProperty('message', 'No se pudo revocar el token OAuth')
  })
})
