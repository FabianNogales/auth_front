import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IssueApiKeyForm } from './IssueApiKeyForm.tsx'
import { ApiKeySecret } from './ApiKeySecret.tsx'
import { ApiKeyTable } from './ApiKeyTable.tsx'
import type { ApiKey } from '../types/apiKey.ts'

const { info, success, error } = vi.hoisted(() => ({
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}))
vi.mock('sonner', () => ({ toast: { info, success, error } }))
const key: ApiKey = {
  id: 1,
  user_id: 2,
  label: 'Prueba',
  created_at: '2026-01-01T12:00:00Z',
  expires_at: null,
  revoked_at: null,
}

describe('HU 31 y HU 33', () => {
  beforeEach(() => vi.clearAllMocks())
  it('exige etiqueta y rechaza una fecha pasada sin llamar a la API', async () => {
    const issue = vi.fn()
    render(<IssueApiKeyForm onIssue={issue} disabled={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Emitir API Key' }))
    expect(
      await screen.findByText('La etiqueta es obligatoria'),
    ).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Etiqueta'), {
      target: { value: 'Prueba' },
    })
    fireEvent.change(screen.getByLabelText('Fecha de expiración (opcional)'), {
      target: { value: '2000-01-01T12:00' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Emitir API Key' }))
    expect(
      await screen.findByText(
        'La fecha de expiración debe ser posterior a la fecha actual',
      ),
    ).toBeInTheDocument()
    expect(issue).not.toHaveBeenCalled()
  })
  it('recorta etiqueta y convierte la fecha local a un instante UTC', async () => {
    const issue = vi.fn().mockResolvedValue(undefined)
    render(<IssueApiKeyForm onIssue={issue} disabled={false} />)
    fireEvent.change(screen.getByLabelText('Etiqueta'), {
      target: { value: '  Equipo A  ' },
    })
    fireEvent.change(screen.getByLabelText('Fecha de expiración (opcional)'), {
      target: { value: '2099-01-01T12:00' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Emitir API Key' }))
    await waitFor(() =>
      expect(issue).toHaveBeenCalledWith(
        'Equipo A',
        new Date('2099-01-01T12:00').toISOString(),
      ),
    )
  })
  it('permite omitir expiración y evita doble envío mientras emite', async () => {
    const issue = vi.fn(() => new Promise<void>(() => {}))
    render(<IssueApiKeyForm onIssue={issue} disabled={false} />)
    fireEvent.change(screen.getByLabelText('Etiqueta'), {
      target: { value: 'Prueba' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Emitir API Key' }))
    await waitFor(() => expect(issue).toHaveBeenCalledWith('Prueba', null))
    expect(screen.getByRole('button', { name: 'Emitiendo…' })).toBeDisabled()
  })
  it('copia el secreto y permite ocultarlo', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const close = vi.fn()
    render(<ApiKeySecret secret="secreto-de-prueba" onClose={close} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }))
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('secreto-de-prueba'),
    )
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Copiada al portapapeles',
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Cerrar y ocultar clave' }),
    )
    expect(close).toHaveBeenCalledOnce()
  })
  it('informa si el portapapeles falla', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    render(<ApiKeySecret secret="secreto" onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copiar' }))
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'No se pudo copiar la clave. Selecciónala y cópiala manualmente.',
      ),
    )
  })
  it('revoca una activa y distingue una ya revocada', () => {
    const revoke = vi.fn()
    const view = render(
      <ApiKeyTable keys={[key]} onRevoke={revoke} pending={false} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Revocar Prueba' }))
    expect(revoke).toHaveBeenCalledWith(1)
    revoke.mockClear()
    view.rerender(
      <ApiKeyTable
        keys={[{ ...key, revoked_at: '2026-01-02T00:00:00Z' }]}
        onRevoke={revoke}
        pending={false}
      />,
    )
    expect(screen.getByText('Revocada')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Revocar Prueba' }))
    expect(info).toHaveBeenCalledWith('Esta API Key ya está revocada')
    expect(revoke).not.toHaveBeenCalled()
  })
})
