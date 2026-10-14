import { useNavigate } from 'react-router'

import { BasicLoginForm } from '../components/BasicLoginForm.tsx'
import styles from './BasicLoginPage.module.css'

const MECHANISMS = ['API Key', 'Basic', 'JWT', 'OAuth 2.0']

/**
 * Pantalla de inicio de sesión (une las 2 HUs): formulario de login con
 * correo+contraseña más el probador de solicitudes Basic contra recurso
 * protegido. Al ingresar, redirige a la pantalla principal del laboratorio.
 */
export function BasicLoginPage() {
  const navigate = useNavigate()

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
            <li key={mechanism}>{mechanism}</li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-label="Acceso">
        <div className={styles.card}>
          <h1>Bienvenido al laboratorio</h1>
          <p className={styles.subtitle}>Accede con tu cuenta de referencia.</p>
          <BasicLoginForm onSuccess={() => void navigate('/perfil')} />
        </div>
      </section>
    </div>
  )
}
