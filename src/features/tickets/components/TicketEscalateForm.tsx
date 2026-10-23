import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { isApiError } from '../../../shared/services/ApiError.ts'
import styles from '../../roles/pages/CreateRolePage.module.css'
import type { RoleResponse } from '../../roles/types/role.ts'
import { escalateTicketSchema, type EscalateTicketValues } from '../schemas/escalateTicketSchema.ts'
import { ROLE_NOT_FOUND_MESSAGE } from '../services/ticketsService.ts'

interface TicketEscalateFormProps {
  roles: RoleResponse[]
  escalable: boolean
  onEscalate: (values: EscalateTicketValues) => Promise<unknown>
}

export function TicketEscalateForm({ roles, escalable, onEscalate }: TicketEscalateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EscalateTicketValues>({
    resolver: zodResolver(escalateTicketSchema),
    defaultValues: { to_role: '', note: '' },
  })

  const onSubmit = async (values: EscalateTicketValues) => {
    try {
      await onEscalate(values)
      reset()
    } catch (caught) {
      if (isApiError(caught) && caught.message === ROLE_NOT_FOUND_MESSAGE) {
        setError('to_role', { message: ROLE_NOT_FOUND_MESSAGE })
      }
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
      <h3>Escalar ticket</h3>
      {!escalable && (
        <p className={styles.subtitle}>Solo se pueden escalar tickets Abiertos o En progreso.</p>
      )}
      <fieldset className={styles.fields} disabled={isSubmitting || !escalable}>
        <div className={styles.field}>
          <label htmlFor="escalate-role">Escalar a rol *</label>
          <select
            id="escalate-role"
            {...register('to_role')}
            aria-invalid={!!errors.to_role}
            aria-describedby={errors.to_role ? 'escalate-role-error' : undefined}
          >
            <option value="">Selecciona un rol</option>
            {roles.map((role) => (
              <option key={role.name} value={role.name}>{role.name}</option>
            ))}
          </select>
          {errors.to_role && (
            <p id="escalate-role-error" role="alert" className={styles.error}>
              {errors.to_role.message}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="escalate-note">Nota de escalamiento</label>
          <textarea id="escalate-note" rows={3} {...register('note')} />
        </div>
      </fieldset>
      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting || !escalable}>
          {isSubmitting ? 'Escalando…' : 'Escalar ticket'}
        </button>
      </div>
    </form>
  )
}