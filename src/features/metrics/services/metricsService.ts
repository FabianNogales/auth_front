import { ApiError, toApiError } from '../../../shared/services/ApiError.ts'
import { httpClient } from '../../../shared/services/httpClient.ts'
import type { Metric, MetricComparison } from '../types/metric.ts'

export const metricsService = {
  async get(id: number, signal?: AbortSignal): Promise<{ metrics: Metric[]; comparison: MetricComparison }> {
    try {
      const [metrics, comparison] = await Promise.all([
        httpClient.get<Metric[]>(`/experiments/${id}/metrics`, { signal }),
        httpClient.get<MetricComparison>(`/experiments/${id}/metrics/compare`, { signal }),
      ])
      return { metrics: metrics.data, comparison: comparison.data }
    } catch (error) {
      const converted = toApiError(error, 'No se pudieron consultar las métricas')
      throw new ApiError('No se pudieron consultar las métricas', { status: converted.status, code: converted.code })
    }
  },
}
