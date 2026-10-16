import { useNavigate } from 'react-router'
import { CreateRoleForm } from '../components/CreateRoleForm.tsx'
import { useCreateRole } from '../hooks/useCreateRole.ts'
import styles from './CreateRolePage.module.css'

export function CreateRolePage() {
  const navigate = useNavigate()
  const { permissions, createRole } = useCreateRole()

  return (
    <main className={styles.page}>
      <header>
        <h1>Crear rol</h1>
        <p className={styles.subtitle}>
          Configura un nuevo conjunto de permisos para el laboratorio.
        </p>
      </header>
      <section className={styles.panel} aria-label="Crear rol">
        {permissions.isPending && <p role="status">Cargando permisos…</p>}
        {permissions.isError && (
          <p role="alert" className={styles.error}>
            {permissions.error.message}{' '}
            <button type="button" onClick={() => void permissions.refetch()}>
              Reintentar
            </button>
          </p>
        )}
        {permissions.data !== undefined && (
          permissions.data.length > 0 ? (
            <CreateRoleForm
              permissions={permissions.data}
              onCreate={(values) => createRole.mutateAsync(values)}
              onCancel={() => void navigate('/')}
            />
          ) : <p>No hay permisos disponibles para crear un rol.</p>
        )}
        {permissions.data === undefined || permissions.data.length === 0 ? (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => void navigate('/')}
          >
            Cancelar
          </button>
        ) : null}
      </section>
    </main>
  )
}
