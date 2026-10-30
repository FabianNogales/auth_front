import { z } from 'zod'
import { AUTHENTICATION_API_VALUES } from '../../../shared/constants/authentication.ts'
import { EXPERIMENT_RESOURCES } from '../constants/experiments.ts'

export const createExperimentSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del experimento es obligatorio').max(255, 'El nombre no puede superar los 255 caracteres'),
  mechanism: z.string().min(1, 'Debe seleccionar un mecanismo').refine(
    (value) => Object.values(AUTHENTICATION_API_VALUES).some((item) => item === value),
    'Debe seleccionar un mecanismo',
  ),
  test_user_id: z.string().min(1, 'Debe seleccionar un usuario de prueba'),
  resources: z.array(z.string()).min(1, 'Debe seleccionar un recurso').refine(
    (values) => values.every((value) => EXPERIMENT_RESOURCES.some((item) => item.id === value)),
    'El recurso seleccionado no está permitido',
  ),
})

export type CreateExperimentValues = z.infer<typeof createExperimentSchema>
