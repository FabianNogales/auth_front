import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { ExperimentCredential } from '../services/experimentExecution.ts'
import type { Experiment } from '../types/experiment.ts'
import { mechanismLabel } from '../constants/experiments.ts'
import styles from '../pages/ExperimentsPage.module.css'

export function ExecuteExperimentForm({ experiment, email, busy, onRun, onCancel }: {
  experiment: Experiment
  email: string
  busy: boolean
  onRun: (credential: ExperimentCredential) => Promise<boolean>
  onCancel: () => void
}) {
  const schema = z.object({ email: z.string(), secret: z.string().min(1, 'Debe proporcionar la credencial del usuario de prueba') }).superRefine((value, context) => {
    if (experiment.mechanism === 'basic' && !z.email().safeParse(value.email.trim()).success) context.addIssue({ code: 'custom', path: ['email'], message: 'Debe proporcionar un correo válido' })
    if (experiment.mechanism !== 'basic' && !value.secret.trim()) context.addIssue({ code: 'custom', path: ['secret'], message: 'Debe proporcionar la credencial del usuario de prueba' })
  })
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ExperimentCredential>({ resolver: zodResolver(schema), defaultValues: { email, secret: '' } })
  const pending = busy || isSubmitting
  const secretLabel = experiment.mechanism === 'basic' ? 'Contraseña del usuario de prueba' : experiment.mechanism === 'api_key' ? 'API Key del usuario de prueba' : experiment.mechanism === 'jwt' ? 'JWT del usuario de prueba' : 'Access token OAuth del usuario de prueba'
  return (
    <form className={styles.form} noValidate autoComplete="off" onSubmit={handleSubmit(async (values) => {
      try { await onRun(values) } finally { reset({ email, secret: '' }) }
    })}>
      <h2>Ejecutar: {experiment.name}</h2>
      <p className={styles.hint}>{mechanismLabel(experiment.mechanism)} · Listado de tickets. La credencial debe pertenecer al usuario de prueba, que se comprobará antes del inicio.</p>
      <fieldset className={styles.fields} disabled={pending}>
        {experiment.mechanism === 'basic' && <div className={styles.field}>
          <label htmlFor="experiment-email">Correo del usuario de prueba</label>
          <input id="experiment-email" type="email" {...register('email')} aria-invalid={!!errors.email} aria-describedby="execution-email-error" />
          <p id="execution-email-error" role={errors.email ? 'alert' : undefined} className={styles.error}>{errors.email?.message}</p>
        </div>}
        <div className={styles.field}>
          <label htmlFor="experiment-secret">{secretLabel}</label>
          <input id="experiment-secret" type="password" autoComplete="off" {...register('secret')} aria-invalid={!!errors.secret} aria-describedby="execution-secret-error" />
          <p id="execution-secret-error" role={errors.secret ? 'alert' : undefined} className={styles.error}>{errors.secret?.message}</p>
        </div>
      </fieldset>
      <p className={styles.hint}>Se realizarán dos solicitudes: una con credencial válida y otra alterada. Mantén esta página abierta hasta finalizar. Es una demostración funcional, no una muestra estadística concluyente.</p>
      <div className={styles.actions}>
        <button type="submit" disabled={pending}>{pending ? 'Ejecutando…' : 'Iniciar experimento'}</button>
        <button type="button" className={styles.secondary} disabled={pending} onClick={() => { reset({ email, secret: '' }); onCancel() }}>Cancelar</button>
      </div>
    </form>
  )
}
