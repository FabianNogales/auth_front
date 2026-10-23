import { formatDateTime } from '../../../shared/utils/formatDateTime.ts'
import { TICKET_PRIORITY_LABELS } from '../constants/ticketPriority.ts'
import type { Ticket } from '../types/ticket.ts'
import { assignedLabel } from '../utils/assignedLabel.ts'
import styles from '../pages/TicketDetailPage.module.css'
import { TicketStatusBadge } from './TicketStatusBadge.tsx'

interface TicketInfoCardProps {
  ticket: Ticket
  createdAt: string | null
  nameOf: (id: number | null) => string
}

export function TicketInfoCard({ ticket, createdAt, nameOf }: TicketInfoCardProps) {
  return (
    <dl className={styles.details}>
      <dt>Descripción</dt>
      <dd>{ticket.description?.trim() ? ticket.description : 'Sin descripción'}</dd>
      <dt>Estado</dt>
      <dd><TicketStatusBadge status={ticket.status} /></dd>
      <dt>Prioridad</dt>
      <dd>{TICKET_PRIORITY_LABELS[ticket.priority]}</dd>
      <dt>Creado por</dt>
      <dd>{nameOf(ticket.created_by)}</dd>
      <dt>Fecha de creación</dt>
      <dd>{formatDateTime(createdAt)}</dd>
      <dt>Responsable</dt>
      <dd>{assignedLabel(ticket, nameOf)}</dd>
      {ticket.escalated_at !== null && (
        <>
          <dt>Escalado el</dt>
          <dd>{formatDateTime(ticket.escalated_at)}</dd>
        </>
      )}
      {ticket.resolved_at !== null && (
        <>
          <dt>Resuelto el</dt>
          <dd>{formatDateTime(ticket.resolved_at)}</dd>
        </>
      )}
      {ticket.closed_at !== null && (
        <>
          <dt>Cerrado el</dt>
          <dd>{formatDateTime(ticket.closed_at)}</dd>
        </>
      )}
    </dl>
  )
}