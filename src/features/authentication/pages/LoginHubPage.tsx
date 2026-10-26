import { Link } from "react-router";

import styles from "./LoginHubPage.module.css";

interface MechanismEntry {
  path: string;
  name: string;
  description: string;
}

const MECHANISMS: MechanismEntry[] = [
  {
    path: "/login/basic",
    name: "Basic",
    description: "Credenciales en cada request (RFC 7617).",
  },
  {
    path: "/login/jwt",
    name: "JWT",
    description: "Token firmado con vigencia y revocación.",
  },
];

/**
 * Hub de entrada al laboratorio: presenta los 4 mecanismos del experimento
 * y enlaza a la pantalla de login de cada uno. Las rutas `/login/api-key`
 * y `/login/oauth` se irán creando a medida que se implementen esos
 * mecanismos.
 */
export function LoginHubPage() {
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
          <p className={styles.subtitle}>
            Elegí un mecanismo de autenticación para comenzar.
          </p>

          <ul className={styles.grid}>
            {MECHANISMS.map((entry) => (
              <li key={entry.path}>
                <Link to={entry.path} className={styles.option}>
                  <span className={styles.optionName}>{entry.name}</span>
                  <span className={styles.optionDescription}>
                    {entry.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
