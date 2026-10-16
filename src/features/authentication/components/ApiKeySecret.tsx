import { useState } from 'react'
import { toast } from 'sonner'
import styles from '../pages/ApiKeysPage.module.css'

export function ApiKeySecret({
  secret,
  onClose,
}: {
  secret: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  return (
    <section className={styles.secret} aria-labelledby="secret-title">
      <h2 id="secret-title">API Key emitida correctamente</h2>
      <p>
        Esta clave se muestra una única vez. Cópiala y entrégala al usuario por
        un canal seguro. Al cerrar esta sección o salir de la pantalla no podrás
        recuperarla.
      </p>
      <code className={styles.secretValue}>{secret}</code>
      <div className={styles.actions}>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(secret)
              setCopied(true)
              toast.success('API Key copiada')
            } catch {
              toast.error(
                'No se pudo copiar la clave. Selecciónala y cópiala manualmente.',
              )
            }
          }}
        >
          Copiar
        </button>
        <button type="button" className={styles.secondary} onClick={onClose}>
          Cerrar y ocultar clave
        </button>
        <span role="status">{copied ? 'Copiada al portapapeles' : ''}</span>
      </div>
    </section>
  )
}
