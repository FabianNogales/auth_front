import type { AUTHENTICATION_API_VALUES } from '../../../shared/constants/authentication.ts'

export type ExperimentMechanism = (typeof AUTHENTICATION_API_VALUES)[keyof typeof AUTHENTICATION_API_VALUES]
export type ExperimentStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface Experiment {
  id: number
  name: string
  mechanism: ExperimentMechanism
  status: ExperimentStatus
  test_user_id: string | null
  resources: string[] | null
  created_at: string | null
  started_at: string | null
  finished_at: string | null
}

export interface CreateExperimentInput {
  name: string
  mechanism: ExperimentMechanism
  test_user_id: string
  resources: string[]
}
