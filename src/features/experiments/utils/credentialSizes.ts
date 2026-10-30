import type { Metric } from '../../metrics/types/metric.ts'
import { mechanismLabel } from '../constants/experiments.ts'
import type { ExperimentMechanism } from '../types/experiment.ts'

export interface CredentialSizeRow {
  mechanism: string
  label: string
  average: number
  min: number
  max: number
  samples: number
}

/**
 * Solo solicitudes con credencial válida: se excluyen los 401 (prueba negativa,
 * su credencial está alterada) y tamaño 0 (solicitud sin credencial).
 */
export function credentialSizeRows(metrics: Metric[]): CredentialSizeRow[] {
  const bySize = new Map<string, number[]>()
  for (const metric of metrics) {
    if (metric.http_status === 401 || metric.credential_size <= 0) continue
    bySize.set(metric.mechanism, [...(bySize.get(metric.mechanism) ?? []), metric.credential_size])
  }
  return [...bySize].map(([mechanism, sizes]) => ({
    mechanism,
    label: mechanismLabel(mechanism as ExperimentMechanism),
    average: Math.round((sizes.reduce((sum, size) => sum + size, 0) / sizes.length) * 100) / 100,
    min: Math.min(...sizes),
    max: Math.max(...sizes),
    samples: sizes.length,
  }))
}

export function credentialSizesCsv(rows: CredentialSizeRow[]): string {
  const header = 'Mecanismo,Tamaño promedio (bytes),Tamaño mínimo (bytes),Tamaño máximo (bytes)'
  return [header, ...rows.map((row) => [row.label, row.average, row.min, row.max].join(','))].join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}