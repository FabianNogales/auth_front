import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { isApiError } from '../../../shared/services/ApiError.ts'
import { useApiKeys } from '../hooks/useApiKeys.ts'
import { IssueApiKeyForm } from '../components/IssueApiKeyForm.tsx'
import { ApiKeySecret } from '../components/ApiKeySecret.tsx'
import { ApiKeyTable } from '../components/ApiKeyTable.tsx'
import styles from './ApiKeysPage.module.css'

export function ApiKeysPage() {
  const { userId: routeId } = useParams()
  const userId =
    routeId &&
    /^\d+$/.test(routeId) &&
    Number.isSafeInteger(Number(routeId)) &&
    Number(routeId) > 0
      ? Number(routeId)
      : null
  // Cambiar de usuario desmonta el componente y elimina el secreto anterior.
  return (
    <ApiKeysWorkspace
      key={routeId ?? 'none'}
      userId={userId}
      invalid={routeId !== undefined && userId === null}
    />
  )
}

function ApiKeysWorkspace({
  userId,
  invalid,
}: {
  userId: number | null
  invalid: boolean
}) {
  const navigate = useNavigate()
  const { users, keys, issue, refresh, revoke } = useApiKeys(userId)
  const [secret, setSecret] = useState<string | null>(null)
  const selected = users.data?.find((user) => Number(user.id) === userId)
  const forbidden =
    isApiError(keys.error) &&
    (keys.error.isForbidden || keys.error.isUnauthorized)
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>CREDENCIALES DEL LABORATORIO</p>
        <h1>API Keys</h1>
        <p>Emite y revoca las claves de acceso de los usuarios.</p>
      </header>
      <section className={styles.panel}>
        <label htmlFor="key-user">Usuario</label>
        <select
          id="key-user"
          value={userId ?? ''}
          disabled={users.isPending}
          onChange={(event) =>
            navigate(
              event.target.value
                ? `/usuarios/${event.target.value}/api-keys`
                : '/api-keys',
            )
          }
        >
          <option value="">Selecciona un usuario</option>
          {users.data?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} — {user.email}
              {user.is_active ? '' : ' (inactivo)'}
            </option>
          ))}
        </select>
        {users.isPending && <p role="status">Cargando usuarios…</p>}
        {users.isError && (
          <p role="alert">
            {users.error.message}{' '}
            <button onClick={() => void users.refetch()}>Reintentar</button>
          </p>
        )}
        {users.isSuccess && !users.data.length && (
          <p>No hay usuarios registrados.</p>
        )}
        {invalid && (
          <p role="alert">El identificador del usuario no es válido.</p>
        )}
        {userId !== null && users.isSuccess && !selected && (
          <p role="alert">Usuario no encontrado.</p>
        )}
      </section>
      {userId !== null && selected && (
        <>
          <section
            className={styles.panel}
            aria-label={`Claves de ${selected.name}`}
          >
            <h2>{selected.name}</h2>
            <p>{selected.email}</p>
            {keys.isPending && <p role="status">Cargando API Keys…</p>}
            {keys.isError && (
              <p role="alert">
                {forbidden
                  ? 'No tienes autorización para administrar las API Keys de este usuario.'
                  : keys.error.message}{' '}
                <button onClick={() => void keys.refetch()}>Reintentar</button>
              </p>
            )}
            {keys.isSuccess && (
              <ApiKeyTable
                keys={keys.data}
                pending={revoke.isPending}
                onRevoke={(id) => revoke.mutate(id)}
              />
            )}
          </section>
          {keys.isSuccess && (
            <section className={styles.panel}>
              {secret !== null ? (
                <ApiKeySecret secret={secret} onClose={() => setSecret(null)} />
              ) : (
                <IssueApiKeyForm
                  disabled={!selected.is_active}
                  onIssue={async (label, expiresAt) => {
                    try {
                      const issued = await issue({
                        user_id: userId,
                        label,
                        expires_at: expiresAt,
                      })
                      setSecret(issued.plain)
                      void refresh(userId)
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : 'No se pudo emitir la API Key.',
                      )
                      throw error
                    }
                  }}
                />
              )}
              {!selected.is_active && (
                <p>
                  El usuario está inactivo. No se pueden emitir nuevas claves.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </main>
  )
}
