import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ApiKeysPage } from './ApiKeysPage.tsx'
import { apiKeyService } from '../services/apiKeyService.ts'
import { useSessionStore } from '../hooks/useSessionStore.ts'
import { ApiError } from '../../../shared/services/ApiError.ts'

vi.mock('../services/apiKeyService.ts', () => ({
  apiKeyService: {
    users: vi.fn(),
    list: vi.fn(),
    issue: vi.fn(),
    revoke: vi.fn(),
  },
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const user = { id: '1', name: 'Ana', email: 'ana@lab.test', is_active: true }
const metadata = {
  id: 10,
  user_id: 1,
  label: 'Prueba',
  created_at: '2026-01-01T00:00:00Z',
  expires_at: null,
  revoked_at: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  useSessionStore.getState().loginBasic('admin@lab.test', 'demo', user)
  vi.mocked(apiKeyService.users).mockResolvedValue([
    user,
    { ...user, id: '2', name: 'Luis' },
  ])
  vi.mocked(apiKeyService.list).mockResolvedValue([metadata])
  vi.mocked(apiKeyService.issue).mockResolvedValue({ key: metadata, plain: 'secreto-unico' })
  vi.mocked(apiKeyService.revoke).mockResolvedValue(undefined)
})

afterEach(() => {
  useSessionStore.getState().logout()
})

function open() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  client.setQueryData(['api-key-users', '1', 'BASIC'], [{ id: '1', name: 'Ana', email: 'ana@lab.test', is_active: true }, { id: '2', name: 'Luis', email: 'luis@lab.test', is_active: true }])
  client.setQueryData(['api-keys', '1', 'BASIC', 1], [metadata])

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/usuarios/1/api-keys']}>
        <Routes>
          <Route path="/usuarios/:userId/api-keys" element={<ApiKeysPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
  return client
}

it('muestra el secreto solo tras emitir, actualiza el listado y lo elimina al cerrar o cambiar de usuario', async () => {
  const client = open()
  await screen.findByRole('button', { name: 'Emitir API Key' })
  const issueButton = screen.getByRole('button', { name: 'Emitir API Key' })
  expect(issueButton).toBeInTheDocument()

  fireEvent.change(screen.getByLabelText('Etiqueta'), {
    target: { value: 'Prueba' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Emitir API Key' }))
  expect(await screen.findByText('secreto-unico')).toBeInTheDocument()
  expect(
    await screen.findByRole('button', { name: 'Revocar Prueba' }),
  ).toBeInTheDocument()
  expect(JSON.stringify(client.getQueryCache().getAll())).not.toContain(
    'secreto-unico',
  )
  expect(client.getMutationCache().getAll()).toHaveLength(0)
  fireEvent.click(
    screen.getByRole('button', { name: 'Cerrar y ocultar clave' }),
  )
  expect(screen.queryByText('secreto-unico')).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Etiqueta'), {
    target: { value: 'Otra' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Emitir API Key' }))
  await screen.findByText('secreto-unico')
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: '2' } })
  await waitFor(() =>
    expect(screen.queryByText('secreto-unico')).not.toBeInTheDocument(),
  )
  fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: '1' } })
  await screen.findByRole('button', { name: 'Emitir API Key' })
  expect(screen.queryByText('secreto-unico')).not.toBeInTheDocument()
  client.clear()
})

it('bloquea la emisión cuando el servidor rechaza el permiso de administración', async () => {
  vi.mocked(apiKeyService.list).mockRejectedValue(
    new ApiError('Sin permiso ADMIN', { status: 403 }),
  )
  const client = open()
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'No tienes autorización',
  )
  expect(
    screen.queryByRole('button', { name: 'Emitir API Key' }),
  ).not.toBeInTheDocument()
  client.clear()
})