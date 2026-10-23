import styles from '../styles/dataTable.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <button type="button" className={styles.pageButton} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </button>
      <span>Página {page} de {totalPages}</span>
      <button type="button" className={styles.pageButton} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Siguiente
      </button>
    </nav>
  )
}