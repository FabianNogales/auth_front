import { useState } from 'react'
import { OAuthIssueForm } from '../components/OAuthIssueForm.tsx'
import { OAuthTokenResult } from '../components/OAuthTokenResult.tsx'
import type { OAuthTokenPair } from '../types/oauth.ts'
import styles from './OAuthPage.module.css'

export function OAuthIssuePage() {
  const [pair, setPair] = useState<OAuthTokenPair | null>(null)
  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>CREDENCIALES DEL LABORATORIO</p>
        <h1>Emitir token OAuth</h1>
        <p>Obtén tus tokens con las credenciales de usuario y cliente.</p>
      </header>
      <section className={styles.panel} aria-label="Credenciales OAuth">
        <OAuthIssueForm onIssued={setPair} onStart={() => setPair(null)} />
      </section>
      {pair && <OAuthTokenResult pair={pair} onClose={() => setPair(null)} />}
    </main>
  )
}
