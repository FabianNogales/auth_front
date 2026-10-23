import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import styles from '../../roles/pages/CreateRolePage.module.css'
import { createTicketSchema, type CreateTicketValues } from '../schemas/createTicketSchema.ts'

interface CreateTicketFormProps {
  onCreate: (values: CreateTicketValues) => Promise<unknown>
  onCancel: () => void
}

export function CreateTicketForm({ onCreate, onCancel }: CreateTicketFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { title: '', description: '' },
  })

  const onSubmit = async (values: CreateTicketValues) => {
    try {
      await onCreate(values)
      reset()
    } catch {
      // La mutation muestra el error; se conservan los datos para reintentar.
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
      <h2>Información del ticket</h2>
      <fieldset className={styles.fields} disabled={isSubmitting}>
        <div className={styles.field}>
          <label htmlFor="ticket-title">Título del ticket *</label>
          <input
            id="ticket-title"
            {...register('title')}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'ticket-title-error' : undefined}
          />
          {errors.title && (
            <p id="ticket-title-error" role="alert" className={styles.error}>
              {errors.title.message}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="ticket-description">Descripción</label>
          <textarea id="ticket-description" rows={5} {...register('description')} />
        </div>
      </fieldset>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} disabled={isSubmitting} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando…' : 'Crear ticket'}
        </button>
      </div>
    </form>
  )
}