import { useNavigate } from 'react-router'

import tableStyles from '../../../shared/styles/dataTable.module.css'
import { useUserNames } from '../../users/hooks/useUserNames.ts'
import styles from '../../roles/pages/CreateRolePage.module.css'
import { TicketsTable } from '../components/TicketsTable.tsx'
import { useTickets } from '../hooks/useTickets.ts'

export function TicketsPage() {
  const navigate = useNavigate()
  const tickets = useTickets()
  const { users, nameOf } = useUserNames()

  return (
    <main className={styles.page}>
      <header className={tableStyles.header}>
        <div>
          <h1>Tickets</h1>
          <p className={styles.subtitle}>
            Consulta los tickets del laboratorio y filtra por estado o responsable.
          </p>
        </div>
        <button type="button" onClick={() => void navigate('/tickets/nuevo')}>
          Crear ticket
        </button>
      </header>

      <section className={styles.panel} aria-label="Listado de tickets">
        {tickets.isPending && <p role="status">Cargando tickets…</p>}
        {tickets.isError && (
          <p role="alert">
            {tickets.error.message}{' '}
            <button type="button" onClick={() => void tickets.refetch()}>Reintentar</button>
          </p>
        )}
        {tickets.isSuccess && (
          <TicketsTable tickets={tickets.data} users={users.data ?? []} nameOf={nameOf} />
        )}
      </section>
    </main>
  )
}