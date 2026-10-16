import { useNavigate, useParams } from 'react-router'
import { useRoles } from '../hooks/useRoles.ts'
import { useRolePermissions } from '../hooks/useRolePermissions.ts'
import { RolePermissionsForm } from '../components/RolePermissionsForm.tsx'
import styles from './CreateRolePage.module.css'

export function RolePermissionsPage() {
  const { name } = useParams()
  const navigate = useNavigate()
  const roles = useRoles()
  const { permissions, save } = useRolePermissions(name ?? '')
  const role = roles.data?.find((item) => item.name === name)

  return (
    <main className={styles.page}>
      <header>
        <h1>Gestionar permisos</h1>
        <p className={styles.subtitle}>Consulta y actualiza los permisos asociados a un rol.</p>
      </header>
      <section className={styles.panel} aria-label="Seleccionar rol">
        <div className={styles.field}>
          <label htmlFor="permissions-role">Rol</label>
          <select id="permissions-role" value={name ?? ''} disabled={roles.isPending || save.isPending}
            onChange={(event) => void navigate(event.target.value
              ? `/roles/${encodeURIComponent(event.target.value)}/permisos`
              : '/roles/permisos')}>
            <option value="">Selecciona un rol</option>
            {roles.data?.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
        </div>
        {roles.isPending && <p role="status">Cargando roles…</p>}
        {roles.isError && <p role="alert">{roles.error.message} <button onClick={() => void roles.refetch()}>Reintentar</button></p>}
        {roles.isSuccess && roles.data.length === 0 && <p>No hay roles disponibles.</p>}
        {name && roles.isSuccess && !role && <p role="alert">Rol no encontrado.</p>}
      </section>
      {role && (
        <section className={styles.panel} aria-label="Permisos del rol">
          {permissions.isPending && <p role="status">Cargando permisos…</p>}
          {permissions.isError && <p role="alert">{permissions.error.message} <button onClick={() => void permissions.refetch()}>Reintentar</button></p>}
          {permissions.data !== undefined && (
            <RolePermissionsForm key={role.name}
              role={role} permissions={permissions.data} pending={save.isPending}
              onSave={(selected) => save.mutateAsync(selected)}
              onBack={() => void navigate('/')} />
          )}
        </section>
      )}
    </main>
  )
}
