import { AUTHENTICATION_API_VALUES, AUTHENTICATION_LABELS, AUTHENTICATION_METHODS } from '../../../shared/constants/authentication.ts'
import type { ExperimentMechanism, ExperimentStatus } from '../types/experiment.ts'

export const EXPERIMENT_RESOURCES = [{ id: 'tickets.list', label: 'Listado de tickets' }] as const

export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  PENDING: 'Pendiente',
  RUNNING: 'En ejecución',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
}

export function mechanismLabel(value: ExperimentMechanism): string {
  const method = AUTHENTICATION_METHODS.find((item) => AUTHENTICATION_API_VALUES[item] === value)
  return method ? AUTHENTICATION_LABELS[method] : value
}

export const experimentKeys = {
  all: ['experiments'] as const,
  list: (userId: string | undefined) => ['experiments', 'list', userId] as const,
}
