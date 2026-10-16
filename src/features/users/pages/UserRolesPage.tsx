import { useNavigate, useParams } from 'react-router'
import { useRoles } from '../../roles/hooks/useRoles.ts'
import { useUserRoles } from '../hooks/useUserRoles.ts'
import { AssignRoleForm } from '../components/AssignRoleForm.tsx'
import styles from '../../roles/pages/CreateRolePage.module.css'

export function UserRolesPage() {
  const { userId } = useParams()
  return <UserRolesWorkspace key={userId ?? 'none'} userId={userId ?? ''} />
}

function UserRolesWorkspace({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const { users, user, assign, revoke } = useUserRoles(userId)
  const roles = useRoles()
  const pending = assign.isPending || revoke.isPending

  return (
    <main className={styles.page}>
      <header>
        <h1>Asignar rol</h1>
        <p className={styles.subtitle}>Administra los roles de un usuario del sistema.</p>
      </header>
      <section className={styles.panel} aria-label="Seleccionar usuario">
        <div className={styles.field}>
          <label htmlFor="roles-user">Usuario</label>
          <select id="roles-user" value={userId} disabled={users.isPending || pending}
            onChange={(event) => void navigate(event.target.value
              ? `/usuarios/${encodeURIComponent(event.target.value)}/roles` : '/usuarios/roles')}>
            <option value="">Selecciona un usuario</option>
            {users.data?.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.email}</option>)}
          </select>
        </div>
        {users.isPending && <p role="status">Cargando usuarios…</p>}
        {users.isError && <p role="alert">{users.error.message} <button onClick={() => void users.refetch()}>Reintentar</button></p>}
        {users.isSuccess && users.data.length === 0 && <p>No hay usuarios disponibles.</p>}
      </section>
      {userId !== '' && user.isPending && <p role="status">Cargando usuario…</p>}
      {userId !== '' && user.isError && (
        <p role="alert">{user.error.message} <button onClick={() => void user.refetch()}>Reintentar</button></p>
      )}
      {user.data && (
        <section className={styles.panel} aria-label="Roles del usuario">
          <h2>{user.data.name}</h2>
          <p>{user.data.email}</p>
          <h3>Roles actuales</h3>
          {user.data.roles.length === 0 ? <p>Sin roles asignados.</p> : (
            <ul>
              {user.data.roles.map((role) => (
                <li key={role.name}>
                  {role.name}{' '}
                  <button type="button" className={styles.secondary} disabled={pending}
                    aria-label={`Revocar ${role.name}`} onClick={() => revoke.mutate(role.name)}>Revocar</button>
                </li>
              ))}
            </ul>
          )}
          {roles.isPending && <p role="status">Cargando roles…</p>}
          {roles.isError && <p role="alert">{roles.error.message} <button onClick={() => void roles.refetch()}>Reintentar</button></p>}
          {roles.isSuccess && (
            <AssignRoleForm roles={roles.data} disabled={pending || roles.data.length === 0}
              onAssign={(role) => assign.mutateAsync(role)} />
          )}
          {roles.isSuccess && roles.data.length === 0 && <p>No hay roles disponibles.</p>}
        </section>
      )}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} disabled={pending} onClick={() => void navigate('/')}>Volver</button>
      </div>
    </main>
  )
}
