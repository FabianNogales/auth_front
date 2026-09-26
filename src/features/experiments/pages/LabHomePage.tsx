import styles from './LabHomePage.module.css'

export function LabHomePage() {
  return (
    <section className={styles.hero} aria-labelledby="lab-title">
      <p className={styles.eyebrow}>Authentication Lab</p>
      <h1 id="lab-title">Autenticación Lab</h1>
      <p className={styles.description}>
        Laboratorio de comparación de mecanismos de autenticación.
      </p>
    </section>
  )
}
