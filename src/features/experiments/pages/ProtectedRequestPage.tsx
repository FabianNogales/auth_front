import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthenticationSelector } from "../components/AuthenticationSelector.tsx";
import {
  emptyCredentials,
  type RequestCredentials,
  MECHANISM_OPTIONS,
  backendMechanism,
} from "../types/requestConfiguration.ts";
import { protectedRequestService } from "../services/protectedRequestService.ts";
import styles from "./ExperimentTools.module.css";
import { experimentService } from "../services/experimentService.ts";
import type { Experiment } from "../types/experiment.ts";
import { useSessionStore } from "../../authentication/hooks/useSessionStore.ts";
import { useQueryClient } from '@tanstack/react-query';
import { ExperimentMetrics, metricsQueryKey } from '../../metrics/index.ts';
export function ProtectedRequestPage() {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const isAdmin = useSessionStore((state) =>
    state.permissions.includes("ADMIN"),
  );
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [contextError, setContextError] = useState("");
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
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    experimentService
      .list()
      .then((data) => {
        if (!active) return;
        setExperiments(data);
        const selected = data.find(
          (item) =>
            String(item.id) === params.get("experimentId") &&
            item.status === "RUNNING",
        );
        if (selected) {
          setExperiment(String(selected.id));
          const option = MECHANISM_OPTIONS.find(
            (item) => item.backend === selected.mechanism,
          );
          if (option) setCredentials(emptyCredentials(option.value));
        }
      })
      .catch(() => {
        if (active)
          setContextError(
            "No se pudo cargar la lista de experimentos. Puedes enviar una solicitud sin experimento.",
          );
      });
    return () => {
      active = false;
    };
  }, [isAdmin, params]);
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
              !experiments.some(
                (item) =>
                  String(item.id) === experiment &&
                  item.status === "RUNNING" &&
                  item.mechanism === backendMechanism(credentials.mechanism),
              )
            ) {
              setError(
                "Selecciona un experimento en ejecución del mismo mecanismo",
              );
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
              if (experiment) await queryClient.invalidateQueries({queryKey:metricsQueryKey(Number(experiment))});
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
              if (value.mechanism !== credentials.mechanism) setExperiment("");
              setCredentials(value);
              setResult(null);
              setError("");
            }}
          />
          <label>
            Experimento (opcional)
            <select
              value={experiment}
              disabled={pending}
              onChange={(event) => {
                setExperiment(event.target.value);
                setResult(null);
              }}
            >
              <option value="">Sin experimento</option>
              {experiments
                .filter(
                  (item) =>
                    item.status === "RUNNING" &&
                    item.mechanism === backendMechanism(credentials.mechanism),
                )
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    #{item.id} · {item.name}
                  </option>
                ))}
            </select>
          </label>
          {contextError && <p role="status">{contextError}</p>}
          {isAdmin && (
            <Link to="/experimentos">Crear o ejecutar un experimento</Link>
          )}
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
      {experiment && <ExperimentMetrics experimentId={Number(experiment)} live />}
    </main>
  );
}
