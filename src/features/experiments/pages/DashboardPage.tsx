import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import tableStyles from '../../../shared/styles/dataTable.module.css'
import { formatDateTime } from '../../../shared/utils/formatDateTime.ts'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import { metricsQueryKey, metricsService } from '../../metrics/index.ts'
import { ExperimentStatusBadge } from '../components/ExperimentStatusBadge.tsx'
import { EXPERIMENT_STATUS_LABELS, experimentKeys, mechanismLabel } from '../constants/experiments.ts'
import { experimentService } from '../services/experimentService.ts'
import type { ExperimentStatus } from '../types/experiment.ts'
import styles from './DashboardPage.module.css'

const CARD_STATUSES: ExperimentStatus[] = ['PENDING', 'RUNNING', 'COMPLETED']

export function DashboardPage() {
  const userId = useSessionStore((state) => state.user?.id)
  const experiments = useQuery({ queryKey: experimentKeys.list(userId), queryFn: experimentService.list, retry: false })
  const list = experiments.data ?? []
  const latest = [...list]
    .sort((a, b) => (Date.parse(b.created_at ?? '') || 0) - (Date.parse(a.created_at ?? '') || 0))
    .slice(0, 5)
  const metrics = useQueries({
    queries: latest.map((experiment) => ({
      queryKey: metricsQueryKey(experiment.id),
      queryFn: () => metricsService.get(experiment.id),
      retry: false,
    })),
  })

  return (
    <main className={tableStyles.stack}>
      <header><h1>Dashboard de experimentos</h1></header>
      {experiments.isPending && <p role="status">Cargando experimentos…</p>}
      {experiments.isError && (
        <p role="alert">{experiments.error.message} <button type="button" onClick={() => void experiments.refetch()}>Reintentar</button></p>
      )}
      {experiments.isSuccess && list.length === 0 && <p className={tableStyles.empty}>Aún no hay experimentos registrados</p>}
      {experiments.isSuccess && list.length > 0 && (
        <>
          <section className={styles.cards} aria-label="Resumen por estado">
            <article className={styles.card}><strong>{list.length}</strong><span>Experimentos totales</span></article>
            {CARD_STATUSES.map((status) => (
              <article key={status} className={styles.card}>
                <strong>{list.filter((experiment) => experiment.status === status).length}</strong>
                <span>{EXPERIMENT_STATUS_LABELS[status]}</span>
              </article>
            ))}
          </section>
          <section className={tableStyles.panel} aria-label="Últimos experimentos">
            <h2>Últimos experimentos</h2>
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <caption>Últimos experimentos y su última métrica</caption>
                <thead>
                  <tr>{['Experimento', 'Mecanismo', 'Estado', 'Creación', 'Última métrica'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr>
                </thead>
                <tbody>
                  {latest.map((experiment, index) => {
                    const query = metrics[index]
                    const last = query?.data?.metrics.at(-1)
                    return (
                      <tr key={experiment.id}>
                        <td><Link to={`/experimentos/comparacion?ids=${experiment.id}`}>#{experiment.id} · {experiment.name}</Link></td>
                        <td>{mechanismLabel(experiment.mechanism)}</td>
                        <td><ExperimentStatusBadge status={experiment.status} /></td>
                        <td>{formatDateTime(experiment.created_at)}</td>
                        <td>
                          {query?.isPending ? 'Cargando…' : last ? `${last.operation} · HTTP ${last.http_status} · ${last.latency_ms} ms` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  )
}