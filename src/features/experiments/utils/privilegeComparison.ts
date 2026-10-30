import type { Metric } from '../../metrics/types/metric.ts'
import { mechanismLabel } from '../constants/experiments.ts'
import type { RoleChangeEvent } from '../services/experimentRoleService.ts'
import type { Experiment } from '../types/experiment.ts'

export interface PrivilegeCell { accepted: number; rejected: number; codes: number[]; samples: Metric[] }
export interface PrivilegeRow { mechanism: string; label: string; before: PrivilegeCell; after: PrivilegeCell; firstAfter: string }

const emptyCell = (): PrivilegeCell => ({ accepted: 0, rejected: 0, codes: [], samples: [] })

function add(cell: PrivilegeCell, metric: Metric): void {
  cell.samples.push(metric)
  if (metric.http_status >= 200 && metric.http_status < 300) cell.accepted += 1
  else if (metric.http_status >= 400) cell.rejected += 1
  if (!cell.codes.includes(metric.http_status)) cell.codes.push(metric.http_status)
}

function firstAfter(row: Pick<PrivilegeRow, 'before' | 'after'>): string {
  const lastBefore = row.before.samples.at(-1)
  const first = row.after.samples[0]
  if (!lastBefore || !first) return 'Faltan solicitudes antes o después del cambio'
  return lastBefore.http_status === first.http_status
    ? `Sin cambio en la primera solicitud posterior (HTTP ${first.http_status})`
    : `Cambió en la primera solicitud posterior: HTTP ${lastBefore.http_status} → ${first.http_status}`
}

/**
 * Separa las métricas de cada experimento en antes/después de su cambio de rol
 * más reciente. `changes` viene con el más reciente primero (experimentRoleService.history).
 * Agrupa por el mecanismo del experimento: las métricas viejas pueden traer 'none'.
 */
export function privilegeRows(
  items: { experiment: Experiment; metrics: Metric[]; changes: RoleChangeEvent[] }[],
): PrivilegeRow[] {
  const rows = new Map<string, Pick<PrivilegeRow, 'mechanism' | 'label' | 'before' | 'after'>>()
  for (const { experiment, metrics, changes } of items) {
    const change = changes[0]
    if (!change) continue
    const watermark = change.payload.after_metric_id
    const changedAt = Date.parse(change.created_at)
    const row = rows.get(experiment.mechanism) ?? {
      mechanism: experiment.mechanism,
      label: mechanismLabel(experiment.mechanism),
      before: emptyCell(),
      after: emptyCell(),
    }
    for (const metric of [...metrics].sort((a, b) => a.id - b.id)) {
      const isAfter = typeof watermark === 'number' ? metric.id > watermark : Date.parse(metric.occurred_at) >= changedAt
      add(isAfter ? row.after : row.before, metric)
    }
    rows.set(experiment.mechanism, row)
  }
  return [...rows.values()].map((row) => ({ ...row, firstAfter: firstAfter(row) }))
}