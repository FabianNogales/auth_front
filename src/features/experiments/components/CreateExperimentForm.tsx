import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { AUTHENTICATION_API_VALUES, AUTHENTICATION_LABELS, AUTHENTICATION_METHODS } from '../../../shared/constants/authentication.ts'
import { isApiError } from '../../../shared/services/ApiError.ts'
import type { LabUser } from '../../authentication/types/auth.ts'
import { EXPERIMENT_RESOURCES } from '../constants/experiments.ts'
import { createExperimentSchema, type CreateExperimentValues } from '../schemas/createExperimentSchema.ts'
import type { CreateExperimentInput } from '../types/experiment.ts'
import styles from '../pages/ExperimentsPage.module.css'

export function CreateExperimentForm({ users, onCreate }: {
  users: LabUser[]
  onCreate: (input: CreateExperimentInput) => Promise<unknown>
}) {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<CreateExperimentValues>({
    resolver: zodResolver(createExperimentSchema),
    defaultValues: { name: '', mechanism: '', test_user_id: '', resources: [] },
  })
  const submit = async (values: CreateExperimentValues) => {
    const method = AUTHENTICATION_METHODS.find((item) => AUTHENTICATION_API_VALUES[item] === values.mechanism)
    if (!method) return
    try {
      await onCreate({ ...values, mechanism: AUTHENTICATION_API_VALUES[method] })
      reset()
    } catch (error) {
      if (isApiError(error) && error.isValidation && typeof error.errors === 'object' && error.errors !== null) {
        for (const field of ['name', 'mechanism', 'test_user_id', 'resources'] as const) {
          const value: unknown = Reflect.get(error.errors, field)
          if (Array.isArray(value) && typeof value[0] === 'string') setError(field, { message: value[0] })
        }
      }
    }
  }
  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(submit)}>
      <h2>Crear experimento</h2>
      <fieldset className={styles.fields} disabled={isSubmitting}>
        <div className={styles.field}>
          <label htmlFor="experiment-name">Nombre del experimento</label>
          <input id="experiment-name" maxLength={255} {...register('name')} aria-invalid={!!errors.name} aria-describedby="experiment-name-error" />
          <p id="experiment-name-error" className={styles.error} role={errors.name ? 'alert' : undefined}>{errors.name?.message}</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="experiment-mechanism">Mecanismo de autenticación</label>
          <select id="experiment-mechanism" {...register('mechanism')} aria-invalid={!!errors.mechanism} aria-describedby="experiment-mechanism-error">
            <option value="">Selecciona un mecanismo</option>
            {AUTHENTICATION_METHODS.map((method) => <option key={method} value={AUTHENTICATION_API_VALUES[method]}>{AUTHENTICATION_LABELS[method]}</option>)}
          </select>
          <p id="experiment-mechanism-error" className={styles.error} role={errors.mechanism ? 'alert' : undefined}>{errors.mechanism?.message}</p>
        </div>
        <div className={styles.field}>
          <label htmlFor="experiment-user">Usuario de prueba</label>
          <select id="experiment-user" {...register('test_user_id')} aria-invalid={!!errors.test_user_id} aria-describedby="experiment-user-error">
            <option value="">Selecciona un usuario</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name} — {user.email}</option>)}
          </select>
          <p id="experiment-user-error" className={styles.error} role={errors.test_user_id ? 'alert' : undefined}>{errors.test_user_id?.message}</p>
        </div>
        <fieldset className={styles.resources} aria-describedby="experiment-resources-error">
          <legend>Recursos involucrados</legend>
          {EXPERIMENT_RESOURCES.map((resource) => (
            <label className={styles.checkbox} key={resource.id}>
              <input type="checkbox" value={resource.id} {...register('resources')} />{resource.label}
            </label>
          ))}
          <p id="experiment-resources-error" className={styles.error} role={errors.resources ? 'alert' : undefined}>{errors.resources?.message}</p>
        </fieldset>
      </fieldset>
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando…' : 'Crear experimento'}</button>
    </form>
  )
}
