import styles from '../../../shared/styles/dataTable.module.css'
import { formatDateTime } from '../../../shared/utils/formatDateTime.ts'
import type { TicketHistoryEntry } from '../types/ticket.ts'
import { historyActionLabel, historyValueLabel } from '../utils/ticketHistory.ts'

interface TicketHistoryListProps {
  entries: TicketHistoryEntry[]
  nameOf: (id: number | null) => string
}

export function TicketHistoryList({ entries, nameOf }: TicketHistoryListProps) {
  if (entries.length === 0) {
    return <p className={styles.empty}>Este ticket aún no tiene historial de cambios.</p>
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Acción</th>
            <th>Valor anterior</th>
            <th>Valor nuevo</th>
            <th>Usuario</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{historyActionLabel(entry.action)}</td>
              <td>{historyValueLabel(entry.action, entry.from_value, nameOf)}</td>
              <td>{historyValueLabel(entry.action, entry.to_value, nameOf)}</td>
              <td>{nameOf(entry.actor_id)}</td>
              <td>{formatDateTime(entry.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}