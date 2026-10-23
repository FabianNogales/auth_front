import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Pagination } from '../../../shared/components/Pagination.tsx'
import styles from '../../../shared/styles/dataTable.module.css'
import { paginate } from '../../../shared/utils/paginate.ts'
import type { LabUser } from '../../authentication/types/auth.ts'
import { TICKET_STATUS_LABELS, TICKET_STATUSES } from '../constants/ticketStatus.ts'
import type { Ticket, TicketStatus } from '../types/ticket.ts'
import { TicketStatusBadge } from './TicketStatusBadge.tsx'

const PAGE_SIZE = 10
const UNASSIGNED = 'none'

interface TicketsTableProps {
  tickets: Ticket[]
  users: LabUser[]
  nameOf: (id: number | null) => string
}

function assignedLabel(ticket: Ticket, nameOf: (id: number | null) => string): string {
  if (ticket.assigned_to !== null) {
    return nameOf(ticket.assigned_to)
  }
  if (ticket.assigned_role !== null) {
    return `Rol ${ticket.assigned_role}`
  }

  return 'Sin asignar'
}

export function TicketsTable({ tickets, users, nameOf }: TicketsTableProps) {
  const navigate = useNavigate()
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [assignee, setAssignee] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const term = search.trim().toLowerCase()
  const filtered = tickets.filter((ticket) => {
    const matchesStatus = status === '' || ticket.status === status
    const matchesAssignee =
      assignee === '' ||
      (assignee === UNASSIGNED
        ? ticket.assigned_to === null
        : String(ticket.assigned_to) === assignee)
    const matchesSearch = term === '' || ticket.title.toLowerCase().includes(term)

    return matchesStatus && matchesAssignee && matchesSearch
  })
  const current = paginate(filtered, page, PAGE_SIZE)

  const openDetail = (id: number) => void navigate(`/tickets/${id}`)

  if (tickets.length === 0) {
    return <p className={styles.empty}>No hay tickets registrados</p>
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            aria-label="Filtrar por estado"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as TicketStatus | '')
              setPage(1)
            }}
          >
            <option value="">Todos los estados</option>
            {TICKET_STATUSES.map((item) => (
              <option key={item} value={item}>{TICKET_STATUS_LABELS[item]}</option>
            ))}
          </select>
          <select
            className={styles.select}
            aria-label="Filtrar por responsable"
            value={assignee}
            onChange={(event) => {
              setAssignee(event.target.value)
              setPage(1)
            }}
          >
            <option value="">Todos los responsables</option>
            <option value={UNASSIGNED}>Sin asignar</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
        <input
          type="search"
          className={styles.search}
          placeholder="Buscar por título"
          aria-label="Buscar tickets"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No se encontraron tickets con esos filtros.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Creado por</th>
                <th>Asignado a</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {current.items.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={styles.rowClickable}
                  tabIndex={0}
                  onClick={() => openDetail(ticket.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      openDetail(ticket.id)
                    }
                  }}
                >
                  <td>#{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td><TicketStatusBadge status={ticket.status} /></td>
                  <td>{nameOf(ticket.created_by)}</td>
                  <td>{assignedLabel(ticket, nameOf)}</td>
                  <td>Ver →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <Pagination page={current.page} totalPages={current.totalPages} onChange={setPage} />
      )}
    </>
  )
}