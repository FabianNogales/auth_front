import { useState } from 'react'
import { Link } from 'react-router'
import { oauthService } from '../services/oauthService.ts'
import { useSessionStore } from '../hooks/useSessionStore.ts'
import { isApiError } from '../../../shared/services/ApiError.ts'
import styles from './OAuthPage.module.css'

export function OAuthRequestPage() {
  const [token, setToken] = useState(
    () => useSessionStore.getState().oauthToken ?? '',
  )
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<{ data: unknown } | null>(null)
  const [error, setError] = useState<string | null>(null)
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>LABORATORIO OAUTH 2.0</p>
        <h1>Solicitud protegida con OAuth</h1>
        <p>
          Comprueba el acceso a los tickets con un token OAuth y los permisos
          actuales de su usuario.
        </p>
      </header>
      <nav className={styles.actions} aria-label="Acciones OAuth">
        <Link to="/oauth/emitir">Obtener tokens</Link>
        <Link to="/oauth/renovar">Renovar token</Link>
        <Link to="/oauth/revocar">Revocar token</Link>
      </nav>
      <section className={styles.panel}>
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault()
            if (pending) return
            setResult(null)
            setError(null)
            if (!token.trim()) {
              setError('No autenticado')
              return
            }
            setPending(true)
            try {
              setResult({ data: await oauthService.protectedRequest(token) })
            } catch (failure) {
              setError(
                isApiError(failure)
                  ? failure.message
                  : 'No se pudo enviar la solicitud OAuth',
              )
            } finally {
              setPending(false)
            }
          }}
        >
          <div>
            <label htmlFor="oauth-mechanism">Mecanismo de autenticación</label>
            <select
              id="oauth-mechanism"
              defaultValue="oauth"
              disabled={pending}
            >
              <option value="oauth">OAuth 2.0</option>
            </select>
          </div>
          <div>
            <label htmlFor="oauth-access">Token OAuth 2.0</label>
            <input
              id="oauth-access"
              type="password"
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              disabled={pending}
            />
          </div>
          <p className={styles.hint}>
            Recurso: GET /tickets. La solicitud incluye Bearer y el
            identificador OAuth.
          </p>
          <button type="submit" disabled={pending}>
            {pending ? 'Enviando…' : 'Enviar solicitud OAuth'}
          </button>
        </form>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {result && (
          <section aria-label="Respuesta del sistema">
            <h2>Respuesta del sistema · HTTP 200</h2>
            <pre className={styles.response}>
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </section>
        )}
      </section>
    </main>
  )
}
