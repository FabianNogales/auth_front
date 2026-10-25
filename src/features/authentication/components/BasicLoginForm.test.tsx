import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { BasicLoginForm } from './BasicLoginForm.tsx'
import { basicAuthService } from '../services/basicAuthService.ts'

vi.mock('../services/basicAuthService.ts', () => ({
  basicAuthService: {
    login: vi.fn(),
  },
}))

const loginMock = vi.mocked(basicAuthService.login)

function renderForm(onSuccess?: () => void) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={client}>
      <BasicLoginForm onSuccess={onSuccess} />
    </QueryClientProvider>,
  )
}

describe('BasicLoginForm', () => {
  it('exige correo y contraseña con mensajes en español', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: /ver inicio/i }))

    expect(
      await screen.findByText('El correo electrónico es obligatorio.'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('La contraseña es obligatoria.'),
    ).toBeInTheDocument()
    expect(loginMock).not.toHaveBeenCalled()
  })

  it('llama al login y redirige al éxito', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    loginMock.mockResolvedValue({
      user: { id: '1', name: 'Ana', email: 'ana@lab.test', is_active: true },
      mechanism: 'basic',
    })
    renderForm(onSuccess)

    await user.type(screen.getByLabelText(/correo electrónico/i), 'ana@lab.test')
    await user.type(screen.getByLabelText(/contraseña/i), 'secreta123')
    await user.click(screen.getByRole('button', { name: /ver inicio/i }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'ana@lab.test',
        password: 'secreta123',
      })
    })
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})