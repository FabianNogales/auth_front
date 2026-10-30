import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expect, it, vi } from 'vitest'
import { ExperimentMetrics } from './ExperimentMetrics.tsx'
import { metricsService } from '../services/metricsService.ts'

vi.mock('../services/metricsService.ts', () => ({ metricsService: { get: vi.fn() } }))

it('muestra únicamente filas reales y comunica las pérdidas', async () => {
  vi.mocked(metricsService.get).mockResolvedValue({ metrics: [{ id: 1, occurred_at: '2026-10-30T12:00:00Z', mechanism: 'jwt', operation: 'GET api/tickets', http_status: 401, latency_ms: 8, auth_ms: 3, credential_size: 123, failed_layer: null }], comparison: { rows: [], losses: 1, valid: false } })
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><ExperimentMetrics experimentId={7} /></QueryClientProvider>)
  expect(await screen.findByText('401')).toBeInTheDocument()
  expect(screen.getAllByRole('row')).toHaveLength(2)
  expect(screen.getByRole('alert')).toHaveTextContent('1 pérdidas')
  expect(screen.getByText('jwt')).toBeInTheDocument()
})
