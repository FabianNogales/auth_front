import { useQuery } from '@tanstack/react-query'
import { metricsService } from '../services/metricsService.ts'

export const metricsQueryKey = (id: number | null) => ['experiment-metrics', id] as const

export function useExperimentMetrics(id: number) {
  return useQuery({ queryKey: metricsQueryKey(id), queryFn: () => metricsService.get(id), retry: false })
}
