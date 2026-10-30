export interface Metric {
  mechanism: string
  operation: string
  http_status: number
  latency_ms: number
  auth_ms: number
  credential_size: number
  failed_layer: string | null
  id: number
  occurred_at: string
}

export interface MetricComparison {
  rows: { mechanism: string; operation: string; n: number; median_ms: number; p95_ms: number; stddev_ms: number }[]
  losses: number
  valid: boolean
}
