import { useNavigate } from 'react-router'

import { JwtLoginForm } from '../components/JwtLoginForm.tsx'
import styles from './JwtLoginPage.module.css'

/**
 * Pantalla de inicio de sesión JWT: formulario de login con
 * correo+contraseña. Al ingresar, redirige a la pantalla principal del laboratorio.
 */
export function JwtLoginPage() {
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
          <li>API Key</li>
          <li>Basic</li>
          <li>JWT</li>
          <li>OAuth 2.0</li>
        </ul>
      </section>

      <section className={styles.panel} aria-label="Acceso">
        <div className={styles.card}>
          <h1>Bienvenido al laboratorio</h1>
          <p className={styles.subtitle}>Accede con tu cuenta JWT.</p>
          <JwtLoginForm onSuccess={() => void navigate('/perfil')} />
        </div>
      </section>
    </div>
  )
}