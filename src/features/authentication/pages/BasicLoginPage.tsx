import { Link, useNavigate } from "react-router";

import { BasicLoginForm } from "../components/BasicLoginForm.tsx";
import styles from "./BasicLoginPage.module.css";

/**
 * Pantalla de inicio de sesión Basic: formulario con correo+contraseña.
 * La elección de mecanismo vive en el hub `/login`.
 */
export function BasicLoginPage() {
  const navigate = useNavigate();

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
          <Link to="/login" className={styles.back}>
            ← Volver a mecanismos
          </Link>
          <h1>Bienvenido al laboratorio</h1>
          <p className={styles.subtitle}>Accede con tu cuenta de referencia.</p>
          <BasicLoginForm onSuccess={() => void navigate("/perfil")} />
        </div>
      </section>
    </div>
  );
}
