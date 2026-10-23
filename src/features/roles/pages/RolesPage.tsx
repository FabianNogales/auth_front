import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import tableStyles from '../../../shared/styles/dataTable.module.css'
import { useUsersWithRoles } from '../../users/hooks/useUsersWithRoles.ts'
import { useRoles } from '../hooks/useRoles.ts'
import styles from './CreateRolePage.module.css'

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

export function RolesPage() {
  const navigate = useNavigate()
  const roles = useRoles()
  const { rows, rolesLoading, rolesError } = useUsersWithRoles()
  const [selected, setSelected] = useState<string | null>(null)
  const [usersOf, setUsersOf] = useState<string | null>(null)

  const selectedRole = roles.data?.find((role) => role.name === selected)
  const usersWithRole = usersOf === null ? [] : rows.filter((row) => row.roles.includes(usersOf))

  return (
    <main className={styles.page}>
      <header className={tableStyles.header}>
        <div>
          <h1>Roles</h1>
          <p className={styles.subtitle}>Organiza los permisos y define los niveles de acceso.</p>
        </div>
        <button type="button" onClick={() => void navigate('/roles/crear')}>
          Crear nuevo rol
        </button>
      </header>

      <section className={styles.panel} aria-label="Roles del laboratorio">
        {roles.isPending && <p role="status">Cargando roles…</p>}
        {roles.isError && (
          <p role="alert">
            {roles.error.message}{' '}
            <button type="button" onClick={() => void roles.refetch()}>Reintentar</button>
          </p>
        )}
        {roles.isSuccess && roles.data.length === 0 && (
          <p className={tableStyles.empty}>No hay roles registrados</p>
        )}
        {roles.isSuccess && roles.data.length > 0 && (
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Descripción</th>
                  <th>Permisos</th>
                  <th>Usuarios</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.data.map((role) => {
                  const count = rows.filter((row) => row.roles.includes(role.name)).length

                  return (
                    <tr
                      key={role.name}
                      className={`${tableStyles.rowClickable} ${selected === role.name ? tableStyles.rowSelected : ''}`}
                      tabIndex={0}
                      onClick={() => setSelected(role.name)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          setSelected(role.name)
                        }
                      }}
                    >
                      <td>
                        <strong>{role.name}</strong>
                        {role.is_system && <span className={tableStyles.muted}>Rol del sistema</span>}
                      </td>
                      <td>{role.description ?? '—'}</td>
                      <td>{plural(role.permissions.length, 'permiso', 'permisos')}</td>
                      <td>
                        <button
                          type="button"
                          className={tableStyles.linkButton}
                          disabled={rolesLoading}
                          onClick={(event) => {
                            event.stopPropagation()
                            setUsersOf(role.name)
                          }}
                        >
                          {rolesLoading ? '…' : plural(count, 'usuario', 'usuarios')}
                        </button>
                      </td>
                      <td>
                        <Link
                          to={`/roles/${encodeURIComponent(role.name)}/permisos`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {role.is_system ? 'Ver permisos' : 'Gestionar permisos'} →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {rolesError && <p role="alert">No se pudieron cargar los usuarios de algunos roles.</p>}
      </section>

      {selectedRole && (
        <section className={styles.panel} aria-label="Permisos del rol">
          <h2>Permisos de {selectedRole.name}</h2>
          {selectedRole.permissions.length === 0 ? (
            <p>Este rol no tiene permisos asignados.</p>
          ) : (
            <ul className={tableStyles.chips}>
              {selectedRole.permissions.map((permission) => (
                <li key={permission} className={tableStyles.chip}>{permission}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {usersOf !== null && (
        <section className={styles.panel} aria-label="Usuarios del rol">
          <h2>Usuarios con el rol {usersOf}</h2>
          {usersWithRole.length === 0 ? (
            <p>Ningún usuario tiene este rol.</p>
          ) : (
            <ul>
              {usersWithRole.map((user) => (
                <li key={user.id}>
                  <Link to={`/usuarios/${encodeURIComponent(user.id)}/roles`}>{user.name}</Link> — {user.email}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  )
}