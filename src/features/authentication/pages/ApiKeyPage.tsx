import { ApiKeyForm } from '../components/ApiKeyForm.tsx'
import styles from './BasicLoginPage.module.css'

const MECHANISMS = ['API Key', 'Basic', 'JWT', 'OAuth 2.0']

/**
 * Pantalla dedicada exclusivamente a la prueba de autenticación mediante API Key (HU-30).
 */
export function ApiKeyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.brand} aria-label="Presentación">
        <h2>
          El acceso correcto.
          <br />
          Con el mecanismo correcto.
        </h2>
        <ul className={styles.mechanisms}>
          {MECHANISMS.map((mechanism) => (
            <li
              key={mechanism}
              style={{
                fontWeight: mechanism === 'API Key' ? 'bold' : 'normal',
                textDecoration: mechanism === 'API Key' ? 'underline' : 'none',
              }}
            >
              {mechanism}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-label="Acceso">
        <div className={styles.card}>
          <h1>Prueba de API Key</h1>
          <p className={styles.subtitle}>
            Ingresa una API Key para probar los endpoints protegidos.
          </p>
          <ApiKeyForm />
        </div>
      </section>
    </div>
  )
}