import { useQueries, useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import tableStyles from '../../../shared/styles/dataTable.module.css'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import { metricsQueryKey, metricsService } from '../../metrics/index.ts'
import { experimentKeys, mechanismLabel } from '../constants/experiments.ts'
import { experimentService } from '../services/experimentService.ts'
import { credentialSizeRows, credentialSizesCsv, downloadCsv } from '../utils/credentialSizes.ts'
import styles from './ExperimentsPage.module.css'
import { PrivilegeComparison } from '../components/PrivilegeComparison.tsx'
import { experimentRoleService } from '../services/experimentRoleService.ts'
import { privilegeRows } from '../utils/privilegeComparison.ts'

export function ExperimentComparisonPage() {
  const userId = useSessionStore((state) => state.user?.id)
  const [params, setParams] = useSearchParams()
  const selected = (params.get('ids') ?? '').split(',').map(Number).filter((id) => Number.isInteger(id) && id > 0)
  const experiments = useQuery({ queryKey: experimentKeys.list(userId), queryFn: experimentService.list, retry: false })
  const results = useQueries({
    queries: selected.map((id) => ({ queryKey: metricsQueryKey(id), queryFn: () => metricsService.get(id), retry: false })),
  })
  const loading = results.some((result) => result.isPending)
  const failed = results.some((result) => result.isError)
  const rows = credentialSizeRows(results.flatMap((result) => result.data?.metrics ?? []))

  const histories = useQueries({
  queries: selected.map((id) => ({
    queryKey: ['role-changes', id],
    queryFn: () => experimentRoleService.history(id),
    retry: false,
  })),
})
const privilegeTable = privilegeRows(
  selected.flatMap((id, index) => {
    const experiment = experiments.data?.find((item) => item.id === id)
    const metrics = results[index]?.data?.metrics
    const changes = histories[index]?.data
    return experiment && metrics && changes ? [{ experiment, metrics, changes }] : []
  }),
)

  const toggle = (id: number) => {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    setParams(next.length ? { ids: next.join(',') } : {})
  }

  return (
    <main className={`${tableStyles.stack} ${styles.page}`}>
      <header>
        <h1>Comparación de experimentos</h1>
        <p className={styles.subtitle}>Tamaño en bytes de la credencial que transporta cada mecanismo.</p>
      </header>
      {selected.length > 0 && <Link to={`/experimentos/revocacion?ids=${selected.join(',')}`}>Comparar comportamiento ante revocación</Link>}

      <section className={tableStyles.panel} aria-label="Selección de experimentos">
        <h2>Experimentos</h2>
        {experiments.isPending && <p role="status">Cargando experimentos…</p>}
        {experiments.isError && <p role="alert">{experiments.error.message}</p>}
        {experiments.data?.length === 0 && <p>Aún no hay experimentos registrados</p>}
        {experiments.data?.map((experiment) => (
          <label key={experiment.id} className={styles.checkbox}>
            <input type="checkbox" checked={selected.includes(experiment.id)} onChange={() => toggle(experiment.id)} />
            #{experiment.id} · {experiment.name} · {mechanismLabel(experiment.mechanism)}
          </label>
        ))}
      </section>

      <section className={tableStyles.panel} aria-label="Tamaños de credencial">
        <div className={tableStyles.toolbar}>
          <h2>Tamaño de credencial</h2>
          <button type="button" disabled={!rows.length} onClick={() => downloadCsv('tamanos-credencial.csv', credentialSizesCsv(rows))}>
            Exportar
          </button>
        </div>
        {loading && <p role="status">Cargando métricas…</p>}
        {failed && <p role="alert">No se pudieron consultar las métricas</p>}
        {!loading && !failed && selected.length > 0 && rows.length === 0 && (
          <p className={tableStyles.empty}>Este experimento no tiene datos registrados</p>
        )}
        {rows.length > 0 && (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <caption>Tamaño de la credencial por mecanismo</caption>
              <thead>
                <tr>
                  {['Mecanismo', 'Tamaño promedio (bytes)', 'Tamaño mínimo (bytes)', 'Tamaño máximo (bytes)'].map((label) => (
                    <th scope="col" key={label}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.mechanism}>
                    <th scope="row">{row.label}</th><td>{row.average}</td><td>{row.min}</td><td>{row.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <PrivilegeComparison rows={privilegeTable} selectedCount={selected.length} loading={loading || histories.some((history) => history.isPending)} />
    </main>
  )
}
