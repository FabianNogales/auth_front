import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import styles from '../pages/ApiKeysPage.module.css'

const schema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'La etiqueta es obligatoria')
    .max(100, 'La etiqueta no puede superar los 100 caracteres'),
  expiresAt: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        (Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.now()),
      'La fecha de expiración debe ser posterior a la fecha actual',
    ),
})
type Values = z.infer<typeof schema>

export function IssueApiKeyForm({
  onIssue,
  disabled,
}: {
  onIssue: (label: string, expiresAt: string | null) => Promise<void>
  disabled: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: '', expiresAt: '' },
  })
  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={handleSubmit(async (values) => {
        try {
          await onIssue(
            values.label,
            values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
          )
          reset()
        } catch {
          /* La página muestra el error; conserva los campos para reintentar. */
        }
      })}
    >
      <h2>Emitir nueva API Key</h2>
      <label htmlFor="key-label">Etiqueta</label>
      <input
        id="key-label"
        {...register('label')}
        aria-invalid={!!errors.label}
        aria-describedby={errors.label ? 'label-error' : undefined}
        disabled={disabled || isSubmitting}
        placeholder="Ej. Prueba de laboratorio"
      />
      {errors.label && (
        <p id="label-error" role="alert" className={styles.error}>
          {errors.label.message}
        </p>
      )}
      <label htmlFor="key-expiry">Fecha de expiración (opcional)</label>
      <input
        id="key-expiry"
        type="datetime-local"
        {...register('expiresAt')}
        aria-invalid={!!errors.expiresAt}
        aria-describedby="expiry-help expiry-error"
        disabled={disabled || isSubmitting}
      />
      <p id="expiry-help" className={styles.hint}>
        Hora local de tu equipo. Se envía al servidor en UTC. Vacío: sin
        expiración.
      </p>
      <p
        id="expiry-error"
        role={errors.expiresAt ? 'alert' : undefined}
        className={styles.error}
      >
        {errors.expiresAt?.message}
      </p>
      <button type="submit" disabled={disabled || isSubmitting}>
        {isSubmitting ? 'Emitiendo…' : 'Emitir API Key'}
      </button>
    </form>
  )
}
