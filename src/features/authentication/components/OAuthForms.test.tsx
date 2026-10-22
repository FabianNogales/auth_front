import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/services/ApiError.ts'
import { oauthService } from '../services/oauthService.ts'
import { OAuthIssuePage } from '../pages/OAuthIssuePage.tsx'
import { OAuthRevokeForm } from './OAuthRevokeForm.tsx'

const { success, info, error } = vi.hoisted(() => ({ success: vi.fn(), info: vi.fn(), error: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success, info, error } }))
vi.mock('../services/oauthService.ts', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/oauthService.ts')>(),
  oauthService: { issueToken: vi.fn(), revokeToken: vi.fn() },
}))

function fillCredentials() {
  for (const [label, value] of [
    ['Correo electrónico', 'admin@lab.test'], ['Contraseña', 'password'],
    ['Identificador del cliente', 'lab-client'], ['Secreto del cliente', 'secret'],
  ]) fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

describe('SCRUM-41 y SCRUM-43', () => {
  beforeEach(() => vi.resetAllMocks())

  it('muestra errores específicos para los cuatro campos vacíos', async () => {
    render(<OAuthIssuePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Obtener token OAuth' }))
    for (const message of [
      'El correo electrónico es obligatorio', 'La contraseña es obligatoria',
      'El identificador del cliente es obligatorio', 'El secreto del cliente es obligatorio',
    ]) expect(await screen.findByText(message)).toBeInTheDocument()
    expect(oauthService.issueToken).not.toHaveBeenCalled()
  })

  it('presenta ambos tokens y duración, limpia credenciales sensibles y permite ocultarlos', async () => {
    vi.mocked(oauthService.issueToken).mockResolvedValue({
      token_type: 'Bearer', access_token: 'access-secret', refresh_token: 'refresh-secret', expires_in: 3600,
    })
    render(<OAuthIssuePage />)
    fillCredentials()
    fireEvent.click(screen.getByRole('button', { name: 'Obtener token OAuth' }))
    expect(await screen.findByText('access-secret')).toBeInTheDocument()
    expect(screen.getByText('refresh-secret')).toBeInTheDocument()
    expect(screen.getByText('Expira en: 3600 s')).toBeInTheDocument()
    expect(screen.getByText('Tipo: Bearer')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toHaveValue('')
    expect(screen.getByLabelText('Secreto del cliente')).toHaveValue('')
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar y ocultar tokens' }))
    expect(screen.queryByText('access-secret')).not.toBeInTheDocument()
    expect(screen.queryByText('refresh-secret')).not.toBeInTheDocument()
  })

  it('muestra No autorizado y asigna validaciones 422 al campo correspondiente', async () => {
    vi.mocked(oauthService.issueToken).mockRejectedValue(new ApiError('No autorizado', { status: 400 }))
    render(<OAuthIssuePage />)
    fillCredentials()
    fireEvent.click(screen.getByRole('button', { name: 'Obtener token OAuth' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No autorizado')
    vi.mocked(oauthService.issueToken).mockRejectedValue(new ApiError('Revisa los campos', {
      status: 422, errors: { client_id: ['Identificador inválido'] },
    }))
    fireEvent.click(screen.getByRole('button', { name: 'Obtener token OAuth' }))
    expect(await screen.findByText('Identificador inválido')).toBeInTheDocument()
  })

  it.each([
    ['revoked', 'Token revocado correctamente'],
    ['already_revoked', 'El token ya estaba revocado'],
  ] as const)('revocación %s muestra el mensaje esperado', async (result, message) => {
    vi.mocked(oauthService.revokeToken).mockResolvedValue(result)
    render(<OAuthRevokeForm />)
    fireEvent.change(screen.getByLabelText('Token de acceso'), { target: { value: 'a'.repeat(64) } })
    fireEvent.click(screen.getByRole('button', { name: 'Revocar token' }))
    await waitFor(() => expect(result === 'revoked' ? success : info).toHaveBeenCalledWith(message))
    expect(screen.getByLabelText('Token de acceso')).toHaveValue('')
  })
})
