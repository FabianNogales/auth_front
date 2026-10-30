import tableStyles from "../../../shared/styles/dataTable.module.css";
import { formatDateTime } from "../../../shared/utils/formatDateTime.ts";
import type { Metric } from "../types/metric.ts";

export function MetricTable({
  metrics,
  caption = "Solicitudes efectivamente registradas por el backend",
}: {
  metrics: (Metric & { experiment_id?: number })[];
  caption?: string;
}) {
  const showExperiment = metrics.some(
    (metric) => metric.experiment_id !== undefined,
  );
  return (
    <div className={tableStyles.tableWrap}>
      <table className={tableStyles.table}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {[
              ...(showExperiment ? ["Experimento"] : []),
              "Mecanismo",
              "Operación",
              "Código",
              "Resultado",
              "Latencia (ms)",
              "Autenticación (ms)",
              "Tamaño de credencial (bytes)",
              "Fecha",
              "Capa de fallo",
            ].map((label) => (
              <th scope="col" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.id}>
              {showExperiment && <td>{metric.experiment_id ?? "—"}</td>}
              <td>{metric.mechanism}</td>
              <td>{metric.operation}</td>
              <td>{metric.http_status}</td>
              <td>
                {metric.http_status >= 200 && metric.http_status < 300
                  ? "Aceptada"
                  : metric.http_status >= 400 && metric.http_status < 500
                    ? "Rechazada"
                    : metric.http_status >= 500
                      ? "Error del servidor"
                      : "Redirigida"}
              </td>
              <td>{metric.latency_ms}</td>
              <td>{metric.auth_ms}</td>
              <td>{metric.credential_size}</td>
              <td>
                <time dateTime={metric.occurred_at} title={metric.occurred_at}>
                  {formatDateTime(metric.occurred_at)}
                </time>
              </td>
              <td>{metric.failed_layer ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
