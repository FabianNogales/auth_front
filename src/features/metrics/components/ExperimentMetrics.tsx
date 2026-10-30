import tableStyles from '../../../shared/styles/dataTable.module.css'
import { useExperimentMetrics } from '../hooks/useExperimentMetrics.ts'
import { MetricTable } from './MetricTable.tsx'
import { useId } from 'react'

export function ExperimentMetrics({
  experimentId,
  live = false,
}: {
  experimentId: number
  live?: boolean
}) {
  const query = useExperimentMetrics(experimentId, live)
  const headingId = useId()
  return (
    <section className={tableStyles.panel} aria-labelledby={headingId}>
      <div className={tableStyles.toolbar}>
        <h2 id={headingId}>Métricas del experimento #{experimentId}</h2>
        <button
          type="button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Actualizar métricas
        </button>
      </div>
      {live && (
        <p>
          Actualización automática cada 2 segundos mientras se ejecuta el
          experimento.
        </p>
      )}
      {query.isPending && <p role="status">Cargando métricas…</p>}
      {query.isError && (
        <p role="alert">
          {query.error.message}{' '}
          <button type="button" onClick={() => void query.refetch()}>
            Reintentar
          </button>
        </p>
      )}
      {query.data && (
        <>
          {(!query.data.comparison.valid ||
            query.data.comparison.losses > 0) && (
            <p role="alert">
              Se registraron {query.data.comparison.losses} pérdidas de
              métricas. Los resultados están incompletos.
            </p>
          )}
          <p aria-live="polite">
            Solicitudes registradas: {query.data.metrics.length}
          </p>
          {!query.data.metrics.length ? (
            <p className={tableStyles.empty}>
              Este experimento no tiene datos registrados
            </p>
          ) : (
            <>
              <MetricTable metrics={query.data.metrics} />
              <p className={tableStyles.muted}>
                Fechas mostradas en tu zona horaria local.
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}
