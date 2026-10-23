import styles from '../../../shared/styles/dataTable.module.css'
import { formatDateTime } from '../../../shared/utils/formatDateTime.ts'
import type { TicketView } from '../types/ticket.ts'

interface TicketViewsListProps {
  views: TicketView[]
  nameOf: (id: number | null) => string
}

export function TicketViewsList({ views, nameOf }: TicketViewsListProps) {
  if (views.length === 0) {
    return <p className={styles.empty}>Aún no hay vistas registradas.</p>
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Fecha y hora</th>
          </tr>
        </thead>
        <tbody>
          {views.map((view) => (
            <tr key={view.id}>
              <td>{nameOf(view.user_id)}</td>
              <td>{formatDateTime(view.viewed_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}