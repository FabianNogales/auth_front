import { EXPERIMENT_STATUS_LABELS } from '../constants/experiments.ts'
import type { ExperimentStatus } from '../types/experiment.ts'
import styles from '../pages/ExperimentsPage.module.css'

export function ExperimentStatusBadge({ status }: { status: ExperimentStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{EXPERIMENT_STATUS_LABELS[status]}</span>
}
