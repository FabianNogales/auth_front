import { useQuery } from '@tanstack/react-query'
import { metricsService } from '../services/metricsService.ts'

export const metricsQueryKey = (id: number | null) =>
  ['experiment-metrics', id] as const

export function useExperimentMetrics(id: number, live = false) {
  return useQuery({
    queryKey: metricsQueryKey(id),
    queryFn: ({ signal }) => metricsService.get(id, signal),
    retry: false,
    refetchInterval: live ? 2000 : false,
  })
}
