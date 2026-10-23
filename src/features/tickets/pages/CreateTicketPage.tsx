import { useNavigate } from 'react-router'

import styles from '../../roles/pages/CreateRolePage.module.css'
import { CreateTicketForm } from '../components/CreateTicketForm.tsx'
import { useCreateTicket } from '../hooks/useCreateTicket.ts'

export function CreateTicketPage() {
  const navigate = useNavigate()
  const createTicket = useCreateTicket()

  return (
    <main className={styles.page}>
      <header>
        <h1>Crear ticket</h1>
        <p className={styles.subtitle}>
          Registra una incidencia o solicitud para observar los mecanismos de autenticación.
        </p>
      </header>
      <section className={styles.panel} aria-label="Crear ticket">
        <CreateTicketForm
          onCreate={async (values) => {
            await createTicket.mutateAsync(values)
            void navigate('/tickets')
          }}
          onCancel={() => void navigate('/tickets')}
        />
      </section>
    </main>
  )
}