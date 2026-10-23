import { TICKET_STATUS_LABELS } from '../constants/ticketStatus.ts'
import type { TicketStatus } from '../types/ticket.ts'
import styles from './TicketStatusBadge.module.css'

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{TICKET_STATUS_LABELS[status]}</span>
}