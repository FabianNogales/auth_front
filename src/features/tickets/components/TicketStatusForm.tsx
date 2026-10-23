import { useState, type FormEvent } from 'react'

import { isApiError } from '../../../shared/services/ApiError.ts'
import styles from '../../roles/pages/CreateRolePage.module.css'
import { TICKET_STATUS_LABELS, TICKET_STATUSES } from '../constants/ticketStatus.ts'
import { canTransition } from '../constants/ticketTransitions.ts'
import type { Ticket, TicketStatus } from '../types/ticket.ts'

const NOT_ALLOWED_MESSAGE = 'No es posible cambiar del estado actual al estado seleccionado'
const CLOSED_MESSAGE = 'No es posible modificar un ticket cerrado'

interface TicketStatusFormProps {
  ticket: Ticket
  pending: boolean
  onChange: (status: TicketStatus) => Promise<unknown>
}

export function TicketStatusForm({ ticket, pending, onChange }: TicketStatusFormProps) {
  const [selected, setSelected] = useState<TicketStatus | ''>('')
  const [error, setError] = useState('')

  // ESCALATED se hace desde "Escalar ticket" (pide rol destino y nota).
  const options = TICKET_STATUSES.filter(
    (status) => status !== ticket.status && status !== 'ESCALATED',
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (ticket.status === 'CLOSED') {
      setError(CLOSED_MESSAGE)
      return
    }
    if (selected === '') {
      setError('Debe seleccionar un estado')
      return
    }
    if (!canTransition(ticket.status, selected)) {
      setError(NOT_ALLOWED_MESSAGE)
      return
    }

    try {
      await onChange(selected)
      setSelected('')
    } catch (caught) {
      if (isApiError(caught) && caught.isValidation) {
        setError(NOT_ALLOWED_MESSAGE)
      }
    }
  }

  return (
    <form className={styles.form} noValidate onSubmit={(event) => void handleSubmit(event)}>
      <h3>Cambiar estado</h3>
      <div className={styles.field}>
        <label htmlFor="ticket-new-status">Nuevo estado</label>
        <select
          id="ticket-new-status"
          value={selected}
          disabled={pending}
          onChange={(event) => {
            setSelected(event.target.value as TicketStatus | '')
            setError('')
          }}
        >
          <option value="">Selecciona un estado</option>
          {options.map((status) => (
            <option key={status} value={status}>{TICKET_STATUS_LABELS[status]}</option>
          ))}
        </select>
        {error && <p role="alert" className={styles.error}>{error}</p>}
      </div>
      <div className={styles.actions}>
        <button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Cambiar estado'}
        </button>
      </div>
    </form>
  )
}