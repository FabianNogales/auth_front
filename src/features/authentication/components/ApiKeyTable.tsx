import { toast } from 'sonner'
import { apiKeyStatus, type ApiKey } from '../types/apiKey.ts'
import styles from '../pages/ApiKeysPage.module.css'

function date(value: string | null) {
  return value === null ? '—' : new Date(value).toLocaleString()
}
export function ApiKeyTable({
  keys,
  onRevoke,
  pending,
}: {
  keys: ApiKey[]
  onRevoke: (id: number) => void
  pending: boolean
}) {
  if (!keys.length)
    return (
      <p className={styles.empty}>
        Este usuario no tiene API Keys registradas.
      </p>
    )
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <caption>API Keys del usuario seleccionado</caption>
        <thead>
          <tr>
            <th>Etiqueta</th>
            <th>Creación</th>
            <th>Expiración</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => {
            const status = apiKeyStatus(key)
            return (
              <tr key={key.id}>
                <td data-label="Etiqueta">
                  {key.label ?? 'Sin etiqueta'}
                  <small>#{key.id}</small>
                </td>
                <td data-label="Creación">{date(key.created_at)}</td>
                <td data-label="Expiración">
                  {key.expires_at ? date(key.expires_at) : 'Sin expiración'}
                </td>
                <td data-label="Estado">
                  <span className={styles.badge} data-status={status}>
                    {status}
                  </span>
                </td>
                <td data-label="Acciones">
                  <button
                    type="button"
                    className={styles.danger}
                    disabled={pending}
                    aria-label={`Revocar ${key.label ?? `API Key ${key.id}`}`}
                    onClick={() => {
                      if (key.revoked_at !== null) {
                        toast.info('Esta API Key ya está revocada')
                        return
                      }
                      onRevoke(key.id)
                    }}
                  >
                    Revocar
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
