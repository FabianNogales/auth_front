import { useRef, useState } from "react";
import { Link } from "react-router";
import { AuthenticationSelector } from "../components/AuthenticationSelector.tsx";
import {
  emptyCredentials,
  type RequestCredentials,
} from "../types/requestConfiguration.ts";
import { protectedRequestService } from "../services/protectedRequestService.ts";
import styles from "./ExperimentTools.module.css";
export function ProtectedRequestPage() {
  const [credentials, setCredentials] = useState<RequestCredentials>(() =>
    emptyCredentials("API_KEY"),
  );
  const [experiment, setExperiment] = useState("");
  const [result, setResult] = useState<{
    status: number;
    data: unknown;
  } | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  return (
    <main className={styles.page}>
      <header>
        <h1>Configurar solicitud protegida</h1>
        <p>
          Elige cómo autenticarte para consultar los tickets. Esta selección no
          cambia tu sesión del laboratorio.
        </p>
      </header>
      <Link to="/experimentos/revocacion">Comparación ante revocación</Link>
      <section className={styles.panel}>
        <form
          className={styles.form}
          onSubmit={async (event) => {
            event.preventDefault();
            if (inFlight.current) return;
            setError("");
            setResult(null);
            const missing =
              credentials.mechanism === "BASIC"
                ? !credentials.email.trim() || !credentials.password
                : credentials.mechanism === "API_KEY"
                  ? !credentials.apiKey.trim()
                  : !credentials.token.trim();
            if (missing) {
              setError("Completa los datos del mecanismo seleccionado");
              return;
            }
            if (
              experiment &&
              (!/^\d+$/.test(experiment) ||
                !Number.isSafeInteger(Number(experiment)) ||
                Number(experiment) < 1)
            ) {
              setError(
                "El identificador del experimento debe ser un entero positivo",
              );
              return;
            }
            inFlight.current = true;
            setPending(true);
            try {
              setResult(
                await protectedRequestService.send(
                  credentials,
                  experiment ? Number(experiment) : null,
                ),
              );
            } catch {
              setError(
                "No se pudo enviar la solicitud. Comprueba la conexión.",
              );
            } finally {
              inFlight.current = false;
              setPending(false);
            }
          }}
        >
          <AuthenticationSelector
            value={credentials}
            disabled={pending}
            onChange={(value) => {
              setCredentials(value);
              setResult(null);
              setError("");
            }}
          />
          <label>
            ID del experimento (opcional)
            <input
              inputMode="numeric"
              value={experiment}
              disabled={pending}
              onChange={(event) => {
                setExperiment(event.target.value);
                setResult(null);
              }}
            />
          </label>
          <p className={styles.hint}>
            Con un experimento en ejecución se registran las métricas de esta
            solicitud. Recurso: listado de tickets.
          </p>
          <button disabled={pending}>
            {pending ? "Enviando…" : "Enviar solicitud"}
          </button>
        </form>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {result && (
          <section aria-label="Respuesta del sistema">
            <h2>Respuesta · HTTP {result.status}</h2>
            {result.status === 401 ? (
              <p role="alert">No autenticado</p>
            ) : result.status === 403 ? (
              <p role="alert">No tienes permisos para acceder a este recurso</p>
            ) : result.status === 400 ? (
              <p role="alert">
                Configuración inválida. Comprueba que el experimento esté en
                ejecución.
              </p>
            ) : (
              <pre className={styles.response}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
