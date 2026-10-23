import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/services/ApiError.ts'
import { oauthService } from '../services/oauthService.ts'
import { useSessionStore } from '../hooks/useSessionStore.ts'
import { OAuthRefreshPage } from './OAuthRefreshPage.tsx'
import { OAuthRequestPage } from './OAuthRequestPage.tsx'

vi.mock('../services/oauthService.ts', () => ({
  oauthService: { refreshToken: vi.fn(), protectedRequest: vi.fn() },
}))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
const oldPair = {
  token_type: 'Bearer',
  access_token: 'access-anterior',
  refresh_token: 'refresh-anterior-largo',
  expires_in: 3600,
}
const newPair = {
  ...oldPair,
  access_token: 'access-renovado',
  refresh_token: 'refresh-renovado-largo',
}
beforeEach(() => {
  vi.resetAllMocks()
  useSessionStore
    .getState()
    .loginBasic('admin@lab.test', 'demo', {
      id: '1',
      name: 'Admin',
      email: 'admin@lab.test',
      is_active: true,
    })
})
afterEach(() => useSessionStore.getState().logout())

it('rechaza token vacío y muestra el recurso al enviar un token válido', async () => {
  render(
    <MemoryRouter>
      <OAuthRequestPage />
    </MemoryRouter>,
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Enviar solicitud OAuth' }),
  )
  expect(screen.getByRole('alert')).toHaveTextContent('No autenticado')
  expect(oauthService.protectedRequest).not.toHaveBeenCalled()
  vi.mocked(oauthService.protectedRequest).mockResolvedValue([
    { id: 7, title: 'Ticket de prueba' },
  ])
  fireEvent.change(screen.getByLabelText('Token OAuth 2.0'), {
    target: { value: 'access-token' },
  })
  fireEvent.click(
    screen.getByRole('button', { name: 'Enviar solicitud OAuth' }),
  )
  expect(await screen.findByText(/Ticket de prueba/)).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
it.each(['expirado', 'revocado', 'inválido'])(
  'muestra No autenticado ante un access %s',
  async () => {
    vi.mocked(oauthService.protectedRequest).mockRejectedValue(
      new ApiError('No autenticado', { status: 401 }),
    )
    render(
      <MemoryRouter>
        <OAuthRequestPage />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByLabelText('Token OAuth 2.0'), {
      target: { value: 'access-invalido' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Enviar solicitud OAuth' }),
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('No autenticado')
  },
)
it('renueva ambos tokens en memoria, permite otra renovación y limpia la sesión al salir', async () => {
  useSessionStore.getState().rememberOAuthPair(oldPair)
  vi.mocked(oauthService.refreshToken).mockResolvedValue(newPair)
  render(
    <MemoryRouter>
      <OAuthRefreshPage />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Renovar token' }))
  expect(await screen.findByText('access-renovado')).toBeInTheDocument()
  expect(screen.getByText('refresh-renovado-largo')).toBeInTheDocument()
  expect(screen.getByLabelText('Token de renovación')).toHaveValue(
    newPair.refresh_token,
  )
  expect(useSessionStore.getState()).toMatchObject({
    oauthToken: newPair.access_token,
    oauthRefreshToken: newPair.refresh_token,
    mechanism: 'BASIC',
  })
  fireEvent.click(
    screen.getByRole('button', { name: 'Cerrar y ocultar tokens' }),
  )
  expect(screen.queryByText('access-renovado')).not.toBeInTheDocument()
  useSessionStore.getState().logout()
  expect(useSessionStore.getState().oauthToken).toBeNull()
  expect(useSessionStore.getState().oauthRefreshToken).toBeNull()
})
it.each([
  'El token de renovación ha expirado',
  'El token de renovación ha sido revocado',
])('muestra la causa exacta: %s', async (message) => {
  useSessionStore.getState().rememberOAuthPair(oldPair)
  vi.mocked(oauthService.refreshToken).mockRejectedValue(
    new ApiError(message, { status: 400 }),
  )
  render(
    <MemoryRouter>
      <OAuthRefreshPage />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Renovar token' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(message)
  expect(useSessionStore.getState().oauthToken).toBeNull()
})
it('no reintenta automáticamente una renovación mientras está pendiente', async () => {
  useSessionStore.getState().rememberOAuthPair(oldPair)
  vi.mocked(oauthService.refreshToken).mockImplementation(
    () => new Promise(() => {}),
  )
  render(
    <MemoryRouter>
      <OAuthRefreshPage />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Renovar token' }))
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Renovando…' })).toBeDisabled(),
  )
  expect(oauthService.refreshToken).toHaveBeenCalledOnce()
})
