import { Link } from 'react-router'

import styles from './NotFoundPage.module.css'

/** 404 del laboratorio: rutas desconocidas dentro y fuera del workspace. */
export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>La ruta que buscás no existe en el laboratorio.</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  )
}
