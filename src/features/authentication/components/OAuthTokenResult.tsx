import { toast } from 'sonner'
import type { OAuthTokenPair } from '../types/oauth.ts'
import styles from '../pages/OAuthPage.module.css'

export function OAuthTokenResult({ pair, onClose }: { pair: OAuthTokenPair; onClose: () => void }) {
  const tokens = [
    { label: 'Token de acceso', value: pair.access_token },
    { label: 'Token de renovación', value: pair.refresh_token },
  ]
  return (
    <section className={styles.secret} aria-labelledby="oauth-result-title">
      <h2 id="oauth-result-title">Tokens OAuth emitidos</h2>
      <p className={styles.hint}>Conserva los tokens en un lugar seguro. Al ocultar el resultado o salir de esta pantalla no podrás recuperarlos aquí.</p>
      <p>Tipo: {pair.token_type}</p>
      <p>Expira en: {pair.expires_in} s</p>
      {tokens.map(({ label, value }) => (
        <div key={label}>
          <h3>{label}</h3>
          <code className={styles.secretValue}>{value}</code>
          <button type="button" onClick={async () => {
            try {
              await navigator.clipboard.writeText(value)
              toast.success(`${label} copiado`)
            } catch {
              toast.error('No se pudo copiar el token. Selecciónalo y cópialo manualmente.')
            }
          }}>Copiar {label.toLowerCase()}</button>
        </div>
      ))}
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onClose}>Cerrar y ocultar tokens</button>
      </div>
    </section>
  )
}
