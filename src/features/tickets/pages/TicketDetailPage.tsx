import { useNavigate, useParams } from 'react-router'

import { isApiError } from '../../../shared/services/ApiError.ts'
import roleStyles from '../../roles/pages/CreateRolePage.module.css'
import { useUserNames } from '../../users/hooks/useUserNames.ts'
import { TicketHistoryList } from '../components/TicketHistoryList.tsx'
import { TicketInfoCard } from '../components/TicketInfoCard.tsx'
import { TicketViewsList } from '../components/TicketViewsList.tsx'
import { useTicketDetail } from '../hooks/useTicketDetail.ts'
import styles from './TicketDetailPage.module.css'

import { useRoles } from '../../roles/hooks/useRoles.ts'
import { TicketEscalateForm } from '../components/TicketEscalateForm.tsx'
import { TicketStatusForm } from '../components/TicketStatusForm.tsx'
import { canEscalate } from '../constants/ticketTransitions.ts'
import { useChangeTicketStatus } from '../hooks/useChangeTicketStatus.ts'
import { useEscalateTicket } from '../hooks/useEscalateTicket.ts'

export function TicketDetailPage() {
  const navigate = useNavigate()
  const { ticketId } = useParams()
  const id = Number(ticketId)
  const validId = Number.isInteger(id) && id > 0
  const { ticket, history, views, createdAt } = useTicketDetail(validId ? id : null)
  const { nameOf } = useUserNames()

  const roles = useRoles()
const changeStatus = useChangeTicketStatus(id)
const escalate = useEscalateTicket(id)

  const notFound = !validId || (ticket.isError && isApiError(ticket.error) && ticket.error.isNotFound)

  return (
    <main className={roleStyles.page}>
      <header>
        <button type="button" className={roleStyles.secondary} onClick={() => void navigate('/tickets')}>
          ← Volver al listado
        </button>
        {ticket.data && (
          <h1 className={styles.title}>
            {ticket.data.title} <small>#{ticket.data.id}</small>
          </h1>
        )}
      </header>

      {validId && ticket.isPending && <p role="status">Cargando ticket…</p>}
      {notFound && <p role="alert">Ticket no encontrado</p>}
      {!notFound && ticket.isError && (
        <p role="alert">
          {ticket.error.message}{' '}
          <button type="button" onClick={() => void ticket.refetch()}>Reintentar</button>
        </p>
      )}

      {ticket.data && (
        <>
          <div className={styles.columns}>
  <section className={roleStyles.panel} aria-label="Datos generales">
    <TicketInfoCard ticket={ticket.data} createdAt={createdAt} nameOf={nameOf} />
  </section>

  <aside className={`${roleStyles.panel} ${styles.aside}`} aria-label="Acciones disponibles">
    <h2>Acciones</h2>
    <TicketStatusForm
      ticket={ticket.data}
      pending={changeStatus.isPending}
      onChange={(status) => changeStatus.mutateAsync(status)}
    />
    {roles.isPending && <p role="status">Cargando roles…</p>}
    {roles.isError && (
      <p role="alert">
        {roles.error.message}{' '}
        <button type="button" onClick={() => void roles.refetch()}>Reintentar</button>
      </p>
    )}
    {roles.isSuccess && (
      <TicketEscalateForm
        roles={roles.data}
        escalable={canEscalate(ticket.data.status)}
        onEscalate={(values) => escalate.mutateAsync(values)}
      />
    )}
  </aside>
</div>

          <section className={roleStyles.panel} aria-label="Historial de cambios">
            <h2>Historial de cambios</h2>
            {history.isPending && <p role="status">Cargando historial…</p>}
            {history.isError && (
              <p role="alert">
                {history.error.message}{' '}
                <button type="button" onClick={() => void history.refetch()}>Reintentar</button>
              </p>
            )}
            {history.isSuccess && <TicketHistoryList entries={history.data} nameOf={nameOf} />}
          </section>

          <section className={roleStyles.panel} aria-label="Historial de vistas">
            <h2>Historial de vistas</h2>
            {views.isPending && <p role="status">Cargando vistas…</p>}
            {views.isError && (
              <p role="alert">
                {views.error.message}{' '}
                <button type="button" onClick={() => void views.refetch()}>Reintentar</button>
              </p>
            )}
            {views.isSuccess && <TicketViewsList views={views.data} nameOf={nameOf} />}
          </section>
        </>
      )}
    </main>
  )
}