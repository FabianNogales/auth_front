import tableStyles from '../../../shared/styles/dataTable.module.css'
import { formatDateTime } from '../../../shared/utils/formatDateTime.ts'
import type { LabUser } from '../../authentication/types/auth.ts'
import { mechanismLabel } from '../constants/experiments.ts'
import type { Experiment } from '../types/experiment.ts'
import { ExperimentStatusBadge } from './ExperimentStatusBadge.tsx'

export function ExperimentsTable({ experiments, users, busy, onStart, onMetrics }: {
  experiments: Experiment[]
  users: LabUser[]
  busy: boolean
  onStart: (experiment: Experiment) => void
  onMetrics: (id: number) => void
}) {
  if (!experiments.length) return <p className={tableStyles.empty}>No hay experimentos registrados.</p>
  const names = new Map(users.map((user) => [user.id, user.name]))
  return (
    <div className={tableStyles.tableWrap}>
      <table className={tableStyles.table}>
        <caption>Experimentos registrados</caption>
        <thead><tr>{['ID', 'Nombre', 'Mecanismo', 'Usuario de prueba', 'Estado', 'Creación', 'Inicio', 'Finalización', 'Acciones'].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{experiments.map((experiment) => (
          <tr key={experiment.id}>
            <td>{experiment.id}</td><td>{experiment.name}</td><td>{mechanismLabel(experiment.mechanism)}</td>
            <td>{experiment.test_user_id === null ? '—' : names.get(experiment.test_user_id) ?? `Usuario #${experiment.test_user_id}`}</td>
            <td><ExperimentStatusBadge status={experiment.status} /></td>
            <td>{formatDateTime(experiment.created_at)}</td><td>{formatDateTime(experiment.started_at)}</td><td>{formatDateTime(experiment.finished_at)}</td>
            <td>
              <button className={tableStyles.linkButton} type="button" disabled={busy || experiment.status === 'RUNNING' || experiment.status === 'FAILED'} onClick={() => onStart(experiment)}>Iniciar experimento</button>
              {' · '}<button className={tableStyles.linkButton} type="button" onClick={() => onMetrics(experiment.id)}>Consultar métricas</button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
