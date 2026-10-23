import { TICKET_STATUS_LABELS } from '../constants/ticketStatus.ts'
import type { TicketStatus } from '../types/ticket.ts'

const ACTION_LABELS: Record<string, string> = {
  created: 'Creación',
  updated: 'Edición',
  assigned: 'Asignación',
  status_changed: 'Cambio de estado',
  closed: 'Cierre',
  escalated: 'Escalamiento',
  deleted: 'Eliminación',
}

export function historyActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action
}

export function historyValueLabel(
  action: string,
  value: string | null,
  nameOf: (id: number | null) => string,
): string {
  if (value === null || value === '') {
    return '—'
  }
  if ((action === 'status_changed' || action === 'closed') && value in TICKET_STATUS_LABELS) {
    return TICKET_STATUS_LABELS[value as TicketStatus]
  }
  if (action === 'assigned' && /^\d+$/.test(value)) {
    return nameOf(Number(value))
  }

  return value
}