import { useState } from 'react'
import tableStyles from '../../../shared/styles/dataTable.module.css'
import { formatDateTime } from '../../../shared/utils/formatDateTime.ts'
import type { Metric } from '../../metrics/types/metric.ts'
import type { PrivilegeRow } from '../utils/privilegeComparison.ts'

const signed = (value: number) => (value > 0 ? `+${value}` : String(value))

function operationLines(samples: Metric[]): string[] {
  const counts = new Map<string, number>()
  for (const metric of samples) {
    const key = `${metric.operation} → ${metric.http_status}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts].map(([key, count]) => (count > 1 ? `${key} (×${count})` : key))
}

export function PrivilegeComparison({ rows, selectedCount, loading }: { rows: PrivilegeRow[]; selectedCount: number; loading: boolean }) {
  const [detail, setDetail] = useState<{ title: string; samples: Metric[] } | null>(null)

  const cell = (row: PrivilegeRow, side: 'before' | 'after') => {
    const data = row[side]
    if (!data.samples.length) return '—'
    const title = `${row.label} · ${side === 'before' ? 'Antes del cambio' : 'Después del cambio'}`
    return (
      <>
        <button type="button" className={tableStyles.linkButton} onClick={() => setDetail({ title, samples: data.samples })}>
          {data.accepted} aceptadas · {data.rejected} rechazadas
        </button>
        {operationLines(data.samples).map((line) => <span key={line} className={tableStyles.muted}>{line}</span>)}
      </>
    )
  }

  return (
    <section className={tableStyles.panel} aria-label="Comportamiento ante cambio de privilegios">
      <h2>Comportamiento ante cambio de privilegios</h2>
      {loading && <p role="status">Cargando comparación…</p>}
      {!loading && selectedCount > 0 && rows.length === 0 && (
        <p className={tableStyles.empty}>Los experimentos seleccionados no tienen un cambio de rol registrado</p>
      )}
      {rows.length > 0 && (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <caption>Solicitudes aceptadas y rechazadas antes y después del cambio de rol</caption>
            <thead>
              <tr>
                {['Mecanismo', 'Antes del cambio', 'Después del cambio', 'Diferencia', 'Primera solicitud posterior'].map((label) => (
                  <th scope="col" key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.mechanism}>
                  <th scope="row">{row.label}</th>
                  <td>{cell(row, 'before')}</td>
                  <td>{cell(row, 'after')}</td>
                  <td>
                    Aceptadas {signed(row.after.accepted - row.before.accepted)}
                    <span className={tableStyles.muted}>Rechazadas {signed(row.after.rejected - row.before.rejected)}</span>
                  </td>
                  <td>{row.firstAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail && (
        <div>
          <h3>{detail.title}</h3>
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <caption>Detalle de las solicitudes</caption>
              <thead>
                <tr>
                  {['Fecha', 'Operación', 'HTTP', 'Latencia (ms)', 'Autenticación (ms)', 'Capa de fallo'].map((label) => (
                    <th scope="col" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.samples.map((metric) => (
                  <tr key={metric.id}>
                    <td>{formatDateTime(metric.occurred_at)}</td><td>{metric.operation}</td><td>{metric.http_status}</td>
                    <td>{metric.latency_ms}</td><td>{metric.auth_ms}</td><td>{metric.failed_layer ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setDetail(null)}>Cerrar detalle</button>
        </div>
      )}
    </section>
  )
}