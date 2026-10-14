import { initialsOf } from '../../../shared/utils/initials.ts'
import { useSessionStore } from '../../authentication/hooks/useSessionStore.ts'
import styles from './ProfilePage.module.css'

/**
 * Perfil del usuario en sesión: identidad + mecanismo activo.
 * Primera página del workspace; simple a propósito.
 */
export function ProfilePage() {
  const user = useSessionStore((state) => state.user)
  const mechanism = useSessionStore((state) => state.mechanism)

  if (user === null) {
    return <p>Sin sesión.</p>
  }

  return (
    <section className={styles.card} aria-labelledby="profile-title">
      <div className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">
          {initialsOf(user.name)}
        </span>
        <div>
          <h1 id="profile-title">{user.name}</h1>
          <p>{user.email}</p>
        </div>
      </div>

      <dl className={styles.rows}>
        <li>
          <dt>Estado</dt>
          <dd className={styles.active}>
            {user.is_active ? '● Activo' : '● Inactivo'}
          </dd>
        </li>
        <li>
          <dt>Mecanismo</dt>
          <dd>
            <span className={styles.badge}>{mechanism ?? '—'}</span>
          </dd>
        </li>
      </dl>
    </section>
  )
}
