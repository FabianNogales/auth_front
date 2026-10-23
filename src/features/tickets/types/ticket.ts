export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/** Ticket tal como lo devuelve el backend (ids de usuario numéricos). */
export interface Ticket {
  id: number
  title: string
  description: string | null
  status: TicketStatus
  priority: TicketPriority
  created_by: number | null
  assigned_to: number | null
  assigned_role: string | null
  escalated_at: string | null
  resolved_at: string | null
  closed_at: string | null
  deleted_at: string | null
}

export interface CreateTicketInput {
  title: string
  description?: string
}

export interface TicketHistoryEntry {
  id: number
  ticket_id: number
  actor_id: number | null
  action: string
  from_value: string | null
  to_value: string | null
  created_at: string
}

export interface TicketView {
  id: number
  ticket_id: number
  user_id: number | null
  viewed_at: string
}

export interface EscalateTicketInput {
  to_role: string
  note?: string
}