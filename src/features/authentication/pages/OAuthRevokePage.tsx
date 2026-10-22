import { OAuthRevokeForm } from '../components/OAuthRevokeForm.tsx'
import styles from './OAuthPage.module.css'

export function OAuthRevokePage() {
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>CREDENCIALES DEL LABORATORIO</p>
        <h1>Revocar token OAuth</h1>
        <p>Invalida un token de acceso y sus tokens de renovación asociados.</p>
      </header>
      <section className={styles.panel} aria-label="Revocación OAuth">
        <OAuthRevokeForm />
      </section>
    </main>
  )
}
