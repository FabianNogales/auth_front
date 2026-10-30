import {
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { ExperimentMetrics } from './ExperimentMetrics.tsx'
import { metricsService } from '../services/metricsService.ts'

vi.mock('../services/metricsService.ts', () => ({
  metricsService: { get: vi.fn() },
}))

it('muestra únicamente filas reales y comunica las pérdidas', async () => {
  vi.mocked(metricsService.get).mockResolvedValue({
    metrics: [
      {
        id: 1,
        occurred_at: '2026-10-30T12:00:00Z',
        mechanism: 'jwt',
        operation: 'GET api/tickets',
        http_status: 401,
        latency_ms: 8,
        auth_ms: 3,
        credential_size: 123,
        failed_layer: null,
      },
    ],
    comparison: { rows: [], losses: 1, valid: false },
  })
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ExperimentMetrics experimentId={7} />
    </QueryClientProvider>,
  )
  expect(await screen.findByText('401')).toBeInTheDocument()
  expect(screen.getAllByRole('row')).toHaveLength(2)
  expect(screen.getByRole('alert')).toHaveTextContent('1 pérdidas')
  expect(screen.getByText('jwt')).toBeInTheDocument()
})

it('actualiza sin duplicar filas y distingue 200, 403 y 401 con fecha y mecanismo', async () => {
  const metric = {
    id: 1,
    occurred_at: '2026-10-30T12:00:00Z',
    mechanism: 'basic',
    operation: 'GET api/tickets',
    http_status: 200,
    latency_ms: 12,
    auth_ms: 3,
    credential_size: 38,
    failed_layer: null,
  }
  const comparison = { rows: [], losses: 0, valid: true }
  vi.mocked(metricsService.get)
    .mockResolvedValueOnce({ metrics: [metric], comparison })
    .mockResolvedValue({
      metrics: [
        metric,
        { ...metric, id: 2, http_status: 403, failed_layer: 'rbac' },
        { ...metric, id: 3, http_status: 401 },
      ],
      comparison,
    })
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ExperimentMetrics experimentId={8} />
    </QueryClientProvider>,
  )
  expect(await screen.findByText('Solicitudes registradas: 1')).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar métricas' }))
  await waitFor(() =>
    expect(screen.getByText('Solicitudes registradas: 3')).toBeVisible(),
  )
  const rows = screen.getAllByRole('row')
  expect(rows).toHaveLength(4)
  expect(within(rows[1]).getByRole('cell', { name: 'Aceptada' })).toBeVisible()
  expect(within(rows[2]).getByRole('cell', { name: '403' })).toBeVisible()
  expect(within(rows[3]).getByRole('cell', { name: '401' })).toBeVisible()
  expect(screen.getAllByText('basic')).toHaveLength(3)
  expect(screen.getAllByTitle('2026-10-30T12:00:00Z')).toHaveLength(3)
})
