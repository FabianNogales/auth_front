import type { TicketStatus } from '../types/ticket.ts'

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  ESCALATED: 'Escalado',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
}

export const TICKET_STATUSES = Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]