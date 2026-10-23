import { useState } from 'react'
import { Link } from 'react-router'
import { oauthService } from '../services/oauthService.ts'
import { useSessionStore } from '../hooks/useSessionStore.ts'
import { OAuthTokenResult } from '../components/OAuthTokenResult.tsx'
import { isApiError } from '../../../shared/services/ApiError.ts'
import type { OAuthTokenPair } from '../types/oauth.ts'
import styles from './OAuthPage.module.css'

export function OAuthRefreshPage() {
  const [token, setToken] = useState(
    () => useSessionStore.getState().oauthRefreshToken ?? '',
  )
  const [pair, setPair] = useState<OAuthTokenPair | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>LABORATORIO OAUTH 2.0</p>
        <h1>Renovar token OAuth</h1>
        <p>
          Obtén un nuevo par de tokens sin volver a ingresar tus credenciales.
        </p>
      </header>
      <nav className={styles.actions} aria-label="Acciones OAuth">
        <Link to="/oauth/emitir">Obtener tokens</Link>
        <Link to="/oauth/solicitud">Probar acceso</Link>
        <Link to="/oauth/revocar">Revocar token</Link>
      </nav>
      <section className={styles.panel}>
        <form
          className={styles.form}
          noValidate
          onSubmit={async (event) => {
            event.preventDefault()
            if (pending) return
            setError(null)
            setPair(null)
            if (!token.trim()) {
              setError('El token de renovación es obligatorio')
              return
            }
            if (token.trim().length < 16) {
              setError(
                'El token de renovación debe tener al menos 16 caracteres',
              )
              return
            }
            setPending(true)
            try {
              const renewed = await oauthService.refreshToken(token)
              useSessionStore.getState().rememberOAuthPair(renewed)
              setToken(renewed.refresh_token)
              setPair(renewed)
            } catch (failure) {
              const message = isApiError(failure)
                ? failure.message
                : 'No se pudo renovar el token OAuth'
              setError(message)
              if (
                isApiError(failure) &&
                failure.status === 400 &&
                useSessionStore.getState().oauthRefreshToken === token.trim()
              ) {
                useSessionStore.getState().clearOAuthTokens()
              }
            } finally {
              setPending(false)
            }
          }}
        >
          <div>
            <label htmlFor="oauth-refresh">Token de renovación</label>
            <input
              id="oauth-refresh"
              type="password"
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              disabled={pending}
            />
          </div>
          <p className={styles.hint}>
            Cada renovación reemplaza ambos tokens. No reutilices un token de
            renovación anterior: hacerlo invalida los tokens derivados.
          </p>
          <button type="submit" disabled={pending}>
            {pending ? 'Renovando…' : 'Renovar token'}
          </button>
        </form>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </section>
      {pair && (
        <>
          <p role="status">
            Token renovado correctamente. El token de acceso anterior ya no es
            válido.
          </p>
          <OAuthTokenResult pair={pair} onClose={() => setPair(null)} />
        </>
      )}
    </main>
  )
}
