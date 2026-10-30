import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import tableStyles from '../../../shared/styles/dataTable.module.css'
import { ExperimentMetrics } from '../../metrics/index.ts'
import { CreateExperimentForm } from '../components/CreateExperimentForm.tsx'
import { ExecuteExperimentForm } from '../components/ExecuteExperimentForm.tsx'
import { ExperimentsTable } from '../components/ExperimentsTable.tsx'
import { useExperiments } from '../hooks/useExperiments.ts'
import { useExperimentExecution } from '../hooks/useExperimentExecution.ts'
import type { Experiment } from '../types/experiment.ts'
import styles from './ExperimentsPage.module.css'

export function ExperimentsPage() {
  const { experiments, users, create } = useExperiments()
  const execution = useExperimentExecution()
  const [selected, setSelected] = useState<Experiment | null>(null)
  const [metricsId, setMetricsId] = useState<number | null>(null)
  const select = (experiment: Experiment) => {
    if (experiment.status === 'COMPLETED') { toast.error('Este experimento ya fue ejecutado'); return }
    if (experiment.test_user_id === null || experiment.resources === null) { toast.error('Este experimento histórico no tiene usuario y recursos configurados'); return }
    setSelected(experiment)
    setMetricsId(experiment.id)
  }
  return (
    <main className={`${tableStyles.stack} ${styles.page}`}>
      <header><h1>Experimentos</h1><p className={styles.subtitle}>Crea y ejecuta pruebas de autenticación sobre recursos del laboratorio.</p></header>
      <section className={tableStyles.panel} aria-label="Creación de experimentos">
        {users.isPending && <p role="status">Cargando usuarios…</p>}
        {users.isError && <p role="alert">{users.error.message} <button type="button" onClick={() => void users.refetch()}>Reintentar</button></p>}
        {users.isSuccess && users.data.length === 0 && <p>No hay usuarios registrados.</p>}
        {users.isSuccess && <CreateExperimentForm users={users.data} onCreate={create.mutateAsync} />}
      </section>
      <section className={tableStyles.panel} aria-label="Listado de experimentos">
        <h2>Experimentos registrados</h2>
        {experiments.isPending && <p role="status">Cargando experimentos…</p>}
        {experiments.isError && <p role="alert">{experiments.error.message} <button type="button" onClick={() => void experiments.refetch()}>Reintentar</button></p>}
        {experiments.data && <ExperimentsTable experiments={experiments.data} users={users.data ?? []} busy={execution.busy} onStart={select} onMetrics={setMetricsId} />}
        <button type="button" className={styles.secondary} disabled={execution.busy || experiments.isFetching} onClick={() => void experiments.refetch()}>Actualizar listado</button>
      </section>
      {selected && <section className={tableStyles.panel} aria-label="Ejecución de experimento">
        <ExecuteExperimentForm key={selected.id} experiment={selected} email={users.data?.find((user) => user.id === selected.test_user_id)?.email ?? ''} busy={execution.busy} onCancel={() => setSelected(null)} onRun={async (credential) => {
          const success = await execution.run(selected, credential)
          if (success) setSelected(null)
          return success
        }} />
        {execution.progress && <p className={styles.progress} role="status">{execution.progress}</p>}
        {execution.error && <p className={styles.error} role="alert">{execution.error}</p>}
      </section>}
      {metricsId !== null && <>
        <nav aria-label="Resultados del experimento">
          <Link to={`/experimentos/revocacion?ids=${metricsId}`}>Ver comportamiento ante revocación</Link>
          {' · '}<Link to={`/experimentos/comparacion?ids=${metricsId}`}>Ver comparación del experimento</Link>
        </nav>
        <ExperimentMetrics key={metricsId} experimentId={metricsId} />
      </>}
    </main>
  )
}
