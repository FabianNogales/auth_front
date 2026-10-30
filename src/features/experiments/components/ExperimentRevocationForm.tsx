import { useState } from "react";
import { isAxiosError } from "axios";
import { useSessionStore } from "../../authentication/hooks/useSessionStore.ts";
import { requestHeaders } from "../services/protectedRequestService.ts";
import type { ExperimentSummary } from "../services/revocationComparisonService.ts";
import { httpClient } from "../../../shared/services/httpClient.ts";
import { experimentHeaders } from "../../../shared/services/authHeaders.ts";
import styles from "../pages/ExperimentTools.module.css";

export function ExperimentRevocationForm({
  experiments,
}: {
  experiments: ExperimentSummary[];
}) {
  const [id, setId] = useState("");
  const [credential, setCredential] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const experiment = experiments.find((item) => String(item.id) === id);
  const running = experiments.filter(
    (item) =>
      item.status.toLowerCase() === "running" && item.mechanism !== "basic",
  );
  return (
    <details>
      <summary>Registrar una revocación de prueba</summary>
      <p>
        Esta acción revoca realmente la credencial indicada y registra el evento
        en el experimento. Usa únicamente credenciales creadas para esa prueba;
        no la credencial con la que administras el laboratorio.
      </p>
      <form
        className={styles.form}
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending || !experiment) return;
          setMessage("");
          if (
            !credential.trim() ||
            (experiment.mechanism === "api_key" &&
              !/^[1-9]\d*$/.test(credential))
          ) {
            setMessage("Introduce una credencial de prueba válida");
            return;
          }
          let headers = experimentHeaders(experiment.id);
          if (experiment.mechanism === "api_key") {
            const session = useSessionStore.getState();
            if (
              session.mechanism === "BASIC" &&
              session.basicEmail &&
              session.basicPassword
            )
              headers = {
                ...headers,
                ...requestHeaders({
                  mechanism: "BASIC",
                  email: session.basicEmail,
                  password: session.basicPassword,
                }),
              };
            else if (session.mechanism === "JWT" && session.jwtToken)
              headers = {
                ...headers,
                ...requestHeaders({
                  mechanism: "JWT",
                  token: session.jwtToken,
                }),
              };
            else if (session.mechanism === "API_KEY" && session.apiKey)
              headers = {
                ...headers,
                ...requestHeaders({
                  mechanism: "API_KEY",
                  apiKey: session.apiKey,
                }),
              };
            else if (session.mechanism === "OAUTH2" && session.oauthToken)
              headers = {
                ...headers,
                ...requestHeaders({
                  mechanism: "OAUTH2",
                  token: session.oauthToken,
                  discriminator: "oauth",
                }),
              };
            else {
              setMessage(
                "Se necesita una sesión de administrador para revocar la API Key",
              );
              return;
            }
          }
          const url =
            experiment.mechanism === "api_key"
              ? `/auth/api-key/revoke/${credential}`
              : `/auth/${experiment.mechanism}/revoke`;
          setPending(true);
          try {
            await httpClient.post(
              url,
              experiment.mechanism === "api_key"
                ? undefined
                : { token: credential.trim() },
              { headers },
            );
            setCredential("");
            setMessage(
              "Revocación registrada. Envía una solicitud con la credencial de prueba anterior y actualiza la comparación.",
            );
          } catch (error: unknown) {
            const status = isAxiosError(error)
              ? error.response?.status
              : undefined;
            setMessage(
              status === 409
                ? "La credencial ya estaba revocada; no se registró una nueva revocación."
                : status === 400
                  ? "No se pudo registrar: comprueba el token y que el experimento siga en ejecución."
                  : "No se pudo confirmar el registro de la revocación. Comprueba el estado de la credencial y los eventos antes de reintentar.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <label>
          Experimento de la revocación
          <select
            value={id}
            disabled={pending}
            onChange={(event) => {
              setId(event.target.value);
              setCredential("");
              setMessage("");
            }}
          >
            <option value="">Selecciona un experimento en ejecución</option>
            {running.map((item) => (
              <option key={item.id} value={item.id}>
                #{item.id} · {item.name} · {item.mechanism}
              </option>
            ))}
          </select>
        </label>
        {experiment && (
          <label>
            {experiment.mechanism === "api_key"
              ? "ID de la API Key de prueba"
              : "Token de acceso de prueba a revocar"}
            <input
              type={experiment.mechanism === "api_key" ? "text" : "password"}
              value={credential}
              autoComplete="off"
              disabled={pending}
              onChange={(event) => setCredential(event.target.value)}
            />
          </label>
        )}
        {!running.length && (
          <p>No hay experimentos de API Key, JWT u OAuth en ejecución.</p>
        )}
        <button disabled={pending || !experiment || !credential.trim()}>
          {pending
            ? "Revocando…"
            : "Revocar credencial de prueba y registrar evento"}
        </button>
        {message && <p role="status">{message}</p>}
      </form>
    </details>
  );
}
