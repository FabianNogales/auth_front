import { useNavigate } from 'react-router'
import { useState } from 'react'

import { BasicLoginForm } from '../components/BasicLoginForm.tsx'
import { JwtLoginForm } from '../components/JwtLoginForm.tsx'
import styles from './BasicLoginPage.module.css'

const MECHANISMS = ['API Key', 'Basic', 'JWT', 'OAuth 2.0'] as const

type Mechanism = (typeof MECHANISMS)[number]

/**
 * Pantalla de inicio de sesión (une las 2 HUs): formulario de login con
 * correo+contraseña más selector de mecanismo. Al ingresar, redirige a la
 * pantalla principal del laboratorio.
 */
export function BasicLoginPage() {
  const navigate = useNavigate()
  const [mechanism, setMechanism] = useState<Mechanism>('Basic')

  return (
    <div className={styles.page}>
      <section className={styles.brand} aria-label="Presentación">
        <h2>
          El acceso correcto.
          <br />
          Con el mecanismo correcto.
        </h2>
        <ul className={styles.mechanisms}>
          {MECHANISMS.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-label="Acceso">
        <div className={styles.card}>
          <h1>Bienvenido al laboratorio</h1>
          <p className={styles.subtitle}>Accede con tu cuenta de referencia.</p>

          <div className={styles.mechanismSelector} role="radiogroup" aria-label="Mecanismo de autenticación">
            {MECHANISMS.map((m) => (
              <label key={m} className={styles.mechanismOption}>
                <input
                  type="radio"
                  name="mechanism"
                  value={m}
                  checked={mechanism === m}
                  onChange={() => setMechanism(m)}
                />
                <span>{m}</span>
              </label>
            ))}
          </div>

          {mechanism === 'Basic' && (
            <BasicLoginForm onSuccess={() => void navigate('/perfil')} />
          )}
          {mechanism === 'JWT' && (
            <JwtLoginForm onSuccess={() => void navigate('/perfil')} />
          )}
          {mechanism === 'API Key' && (
            <p className={styles.comingSoon}>API Key: usa el header <code>X-API-Key</code> directamente.</p>
          )}
          {mechanism === 'OAuth 2.0' && (
            <p className={styles.comingSoon}>OAuth 2.0: usa <code>POST /api/auth/oauth/token</code> con grant_type=password.</p>
          )}
        </div>
      </section>
    </div>
  )
}
