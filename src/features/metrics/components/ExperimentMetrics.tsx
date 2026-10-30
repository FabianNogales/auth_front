import tableStyles from '../../../shared/styles/dataTable.module.css'
import { useExperimentMetrics } from '../hooks/useExperimentMetrics.ts'

export function ExperimentMetrics({ experimentId }: { experimentId: number }) {
  const query = useExperimentMetrics(experimentId)
  return (
    <section className={tableStyles.panel} aria-labelledby="experiment-metrics-title">
      <h2 id="experiment-metrics-title">Métricas del experimento #{experimentId}</h2>
      {query.isPending && <p role="status">Cargando métricas…</p>}
      {query.isError && <p role="alert">{query.error.message} <button type="button" onClick={() => void query.refetch()}>Reintentar</button></p>}
      {query.data && <>
        {(!query.data.comparison.valid || query.data.comparison.losses > 0) && <p role="alert">Se registraron {query.data.comparison.losses} pérdidas de métricas. Los resultados están incompletos.</p>}
        {!query.data.metrics.length ? <p className={tableStyles.empty}>No hay métricas registradas para este experimento.</p> : (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <caption>Solicitudes efectivamente registradas por el backend</caption>
              <thead><tr>{['Mecanismo', 'Operación', 'HTTP', 'Latencia (ms)', 'Autenticación (ms)', 'Credencial (bytes)', 'Capa de fallo'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
              <tbody>{query.data.metrics.map((metric, index) => (
                <tr key={index}>
                  <td>{metric.mechanism}</td><td>{metric.operation}</td><td>{metric.http_status}</td><td>{metric.latency_ms}</td><td>{metric.auth_ms}</td><td>{metric.credential_size}</td><td>{metric.failed_layer ?? '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </>}
    </section>
  )
}
