import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, expect, it, vi } from 'vitest'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import { executeExperiment } from '../services/experimentExecution.ts'
import type { Experiment } from '../types/experiment.ts'
import { useExperimentExecution } from './useExperimentExecution.ts'

vi.mock('../services/experimentExecution.ts', () => ({ executeExperiment: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))

afterEach(() => { useSessionStore.getState().logout(); vi.resetAllMocks() })

it('bloquea invocaciones simultáneas y no pone credenciales en MutationCache', async () => {
  const client = new QueryClient()
  useSessionStore.getState().loginBasic('admin@lab.test', 'fixture', { id: '1', name: 'Admin', email: 'admin@lab.test', is_active: true })
  const experiment: Experiment = { id: 7, name: 'Prueba', mechanism: 'api_key', status: 'PENDING', test_user_id: '42', resources: ['tickets.list'], created_at: null, started_at: null, finished_at: null }
  let release: ((value: Awaited<ReturnType<typeof executeExperiment>>) => void) | undefined
  vi.mocked(executeExperiment).mockImplementation(() => new Promise((resolve) => { release = resolve }))
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>
  const { result } = renderHook(() => useExperimentExecution(), { wrapper })
  let first: Promise<boolean> | undefined
  act(() => { first = result.current.run(experiment, { email: '', secret: 'temporary' }) })
  await act(async () => { expect(await result.current.run(experiment, { email: '', secret: 'second' })).toBe(false) })
  expect(executeExperiment).toHaveBeenCalledOnce()
  expect(result.current.busy).toBe(true)
  expect(client.getMutationCache().getAll()).toHaveLength(0)
  await act(async () => {
    release?.({ experiment: { ...experiment, status: 'COMPLETED' }, metrics: [], comparison: { rows: [], losses: 2, valid: false } })
    await first
  })
  expect(result.current.busy).toBe(false)
  expect(JSON.stringify(client.getQueryCache().getAll().map((query) => query.state))).not.toContain('temporary')
})
