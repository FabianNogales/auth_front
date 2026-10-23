import type { TicketStatus } from '../types/ticket.ts'

export const TICKET_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'ESCALATED', 'CLOSED'],
  IN_PROGRESS: ['ESCALATED', 'RESOLVED', 'CLOSED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['IN_PROGRESS', 'CLOSED'],
  CLOSED: [],
}

export const canTransition = (from: TicketStatus, to: TicketStatus): boolean =>
  TICKET_TRANSITIONS[from].includes(to)

export const canEscalate = (from: TicketStatus): boolean => canTransition(from, 'ESCALATED')