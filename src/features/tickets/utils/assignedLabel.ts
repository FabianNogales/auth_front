import type { Ticket } from '../types/ticket.ts'

export function assignedLabel(ticket: Ticket, nameOf: (id: number | null) => string): string {
  if (ticket.assigned_to !== null) {
    return nameOf(ticket.assigned_to)
  }
  if (ticket.assigned_role !== null) {
    return `Rol ${ticket.assigned_role}`
  }

  return 'Sin asignar'
}