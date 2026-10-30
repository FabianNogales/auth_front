import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  revocationComparisonService,
  type ExperimentSummary,
  type ExperimentEvidence,
} from "../services/revocationComparisonService.ts";
import { revocationRows } from "../utils/revocationComparison.ts";
import styles from "./ExperimentTools.module.css";
import table from "../../../shared/styles/dataTable.module.css";
import { ExperimentRevocationForm } from "../components/ExperimentRevocationForm.tsx";
import { useSessionStore } from "../../authentication/hooks/useSessionStore.ts";
export function RevocationComparisonPage() {
  const [params] = useSearchParams();
  const isAdmin = useSessionStore((state) =>
    state.permissions.includes("ADMIN"),
  );
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [selected, setSelected] = useState<number[]>(() => [
    ...new Set(
      (params.get("ids") ?? "")
        .split(",")
        .map(Number)
        .filter((id) => Number.isSafeInteger(id) && id > 0),
    ),
  ]);
  const [evidence, setEvidence] = useState<ExperimentEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const request = useRef({ version: 0 });
  useEffect(() => {
    if (!isAdmin) return;
    const generation = request.current;
    let active = true;
    revocationComparisonService
      .experiments()
      .then((data) => {
        if (active) setExperiments(data);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar los experimentos");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      generation.version++;
    };
  }, [isAdmin]);
  if (!isAdmin)
    return (
      <main className={styles.page}>
        <h1>Comportamiento ante revocación</h1>
        <p>
          Necesitas permiso de administrador para acceder a esta comparación.
        </p>
      </main>
    );
  return (
    <main className={styles.page}>
      <header>
        <h1>Comportamiento ante revocación</h1>
        <p>
          Compara las respuestas registradas después de revocar una credencial
          en cada experimento.
        </p>
      </header>
      <Link to="/solicitudes/configurar">Configurar solicitud</Link>
      <Link to="/experimentos">Crear y ejecutar experimentos</Link>
      {selected.length > 0 && (
        <Link to={`/experimentos/comparacion?ids=${selected.join(",")}`}>
          Ver otras comparaciones de los seleccionados
        </Link>
      )}
      <section className={styles.panel}>
        <h2>Experimentos a comparar</h2>
        {loading ? (
          <p role="status">Cargando experimentos…</p>
        ) : experiments.length === 0 ? (
          <p>No hay experimentos disponibles.</p>
        ) : (
          <div className={styles.choices}>
            {experiments.map((experiment) => (
              <label key={experiment.id}>
                <input
                  type="checkbox"
                  disabled={pending}
                  checked={selected.includes(experiment.id)}
                  onChange={(event) => {
                    setSelected((ids) =>
                      event.target.checked
                        ? [...ids, experiment.id]
                        : ids.filter((id) => id !== experiment.id),
                    );
                    setEvidence([]);
                    setError("");
                  }}
                />
                #{experiment.id} · {experiment.name} · {experiment.mechanism} ·{" "}
                {experiment.status}
              </label>
            ))}
          </div>
        )}
        <p className={styles.hint}>
          Selecciona ejecuciones del mismo escenario, con una credencial de
          prueba por experimento. Solo se incluyen solicitudes posteriores a un
          evento de revocación registrado; los experimentos antiguos pueden no
          tener esa evidencia.
        </p>
        <button
          disabled={loading || pending || !selected.length}
          onClick={async () => {
            const version = ++request.current.version;
            setPending(true);
            setError("");
            setEvidence([]);
            try {
              const data = await Promise.all(
                experiments
                  .filter((item) => selected.includes(item.id))
                  .map((item) => revocationComparisonService.evidence(item)),
              );
              if (request.current.version === version) setEvidence(data);
            } catch {
              if (request.current.version === version)
                setError(
                  "No se pudieron cargar las evidencias. Intenta actualizar de nuevo.",
                );
            } finally {
              if (request.current.version === version) setPending(false);
            }
          }}
        >
          {pending ? "Consultando…" : "Actualizar comparación"}
        </button>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </section>
      <section className={styles.panel} aria-label="Resultados de revocación">
        <div className={table.tableWrap}>
          <table className={`${table.table} ${styles.comparisonTable}`}>
            <caption>Respuestas observadas después de la revocación</caption>
            <thead>
              <tr>
                <th>Mecanismo</th>
                <th>Código de respuesta tras revocación</th>
                <th>Estado de la credencial observado</th>
                <th>Descripción del comportamiento</th>
                <th>Solicitudes</th>
              </tr>
            </thead>
            <tbody>
              {revocationRows(evidence).map((row) => (
                <tr key={row.mechanism}>
                  <th scope="row">{row.label}</th>
                  <td>{row.codes}</td>
                  <td>{row.state}</td>
                  <td>{row.description}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.hint}>
          Un 401 indica rechazo de autenticación; por sí solo no distingue
          revocación, expiración o una credencial incorrecta. Un 403 es una
          denegación de autorización. Basic no tiene revocación de token.
        </p>
        <p className={styles.hint}>
          Las nuevas solicitudes rechazadas conservan su mecanismo de
          autenticación. En registros históricos «none» se usa el mecanismo
          configurado del experimento. No mezcles credenciales en una misma
          ejecución.
        </p>
      </section>
      <section className={styles.panel}>
        <ExperimentRevocationForm experiments={experiments} />
      </section>
    </main>
  );
}
