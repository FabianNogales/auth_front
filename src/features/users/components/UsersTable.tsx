import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Pagination } from '../../../shared/components/Pagination.tsx'
import styles from '../../../shared/styles/dataTable.module.css'
import { paginate } from '../../../shared/utils/paginate.ts'
import type { UserRow } from '../hooks/useUsersWithRoles.ts'

const PAGE_SIZE = 10

export function UsersTable({ rows }: { rows: UserRow[] }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const term = search.trim().toLowerCase()
  const filtered =
    term === ''
      ? rows
      : rows.filter(
          (row) =>
            row.name.toLowerCase().includes(term) ||
            row.email.toLowerCase().includes(term),
        )
  const current = paginate(filtered, page, PAGE_SIZE)

  const openDetail = (id: string) =>
    void navigate(`/usuarios/${encodeURIComponent(id)}/roles`)

  if (rows.length === 0) {
    return <p className={styles.empty}>No hay usuarios registrados</p>
  }

  return (
    <>
      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>No se encontraron usuarios con ese criterio.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {current.items.map((row) => (
                <tr
                  key={row.id}
                  className={styles.rowClickable}
                  tabIndex={0}
                  onClick={() => openDetail(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      openDetail(row.id)
                    }
                  }}
                >
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>
                    {!row.rolesLoaded ? '…' : row.roles.length === 0 ? 'Sin rol' : row.roles.join(', ')}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${row.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                      {row.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
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