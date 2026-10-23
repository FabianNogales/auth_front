import type { TicketPriority } from '../types/ticket.ts'

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}