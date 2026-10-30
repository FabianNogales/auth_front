import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import table from "../../../shared/styles/dataTable.module.css";
import { downloadCsv } from "../../experiments/utils/credentialSizes.ts";
import {
  latencyRows,
  latencyCsv,
  type LatencySource,
} from "../utils/latencyComparison.ts";
import { MetricTable } from "./MetricTable.tsx";
import styles from "./LatencyComparison.module.css";

interface Props {
  sources: LatencySource[];
  selectedCount: number;
  excludedCount: number;
  loading: boolean;
  failed: boolean;
}
export function LatencyComparison({
  sources,
  selectedCount,
  excludedCount,
  loading,
  failed,
}: Props) {
  const [operationChoice, setOperation] = useState("");
  const [statusChoice, setStatus] = useState("all");
  const [selectedMechanism, setSelectedMechanism] = useState("");
  const metrics = sources.flatMap((source) => source.metrics);
  const operations = [
    ...new Set(metrics.map((metric) => metric.operation)),
  ].sort();
  const operation = operations.includes(operationChoice)
    ? operationChoice
    : (operations[0] ?? "");
  const statuses = [
    ...new Set(
      metrics
        .filter((metric) => metric.operation === operation)
        .map((metric) => metric.http_status),
    ),
  ].sort((a, b) => a - b);
  const status =
    statusChoice !== "all" && statuses.includes(Number(statusChoice))
      ? Number(statusChoice)
      : null;
  const rows = latencyRows(sources, operation, status);
  const hasData = rows.some((row) => row.n > 0);
  const ready = !loading && !failed && sources.length > 0;
  const losses = sources.reduce(
    (sum, source) => sum + source.comparison.losses,
    0,
  );
  const valid =
    losses === 0 && sources.every((source) => source.comparison.valid);
  const detail = rows.find((row) => row.mechanism === selectedMechanism);
  const unidentified = metrics.filter(
    (metric) => !rows.some((row) => row.mechanism === metric.mechanism),
  ).length;
  return (
    <section className={table.panel} aria-label="Comparación de latencias">
      <div className={table.toolbar}>
        <h2>Comparación de latencias</h2>
        <button
          type="button"
          disabled={!ready || !hasData}
          onClick={() =>
            downloadCsv(
              "comparacion-latencias.csv",
              latencyCsv(rows, sources, operation, status),
            )
          }
        >
          Exportar resultados
        </button>
      </div>
      {selectedCount === 0 && (
        <p>Selecciona experimentos completados para comparar sus latencias.</p>
      )}
      {excludedCount > 0 && (
        <p>
          Se excluyen {excludedCount} experimentos que no están completados.
        </p>
      )}
      {loading && <p role="status">Cargando comparación de latencias…</p>}
      {failed && (
        <p role="alert">
          No se pudo cargar toda la comparación. No se muestran resultados
          parciales.
        </p>
      )}
      {ready && metrics.length === 0 && (
        <p>Este experimento no tiene datos registrados</p>
      )}
      {ready && metrics.length > 0 && (
        <>
          <div className={styles.filters}>
            <label>
              Operación a comparar
              <select
                value={operation}
                onChange={(event) => {
                  setOperation(event.target.value);
                  setStatus("all");
                  setSelectedMechanism("");
                }}
              >
                {operations.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Respuestas HTTP
              <select
                value={status ?? "all"}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setSelectedMechanism("");
                }}
              >
                <option value="all">Todas las respuestas</option>
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    HTTP {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!valid && (
            <p role="alert" className={styles.warning}>
              Comparación no válida: se registraron {losses} pérdidas o datos
              incompletos. Esta condición también se incluye en la exportación.
            </p>
          )}
          {rows.some((row) => row.n > 0 && row.n < 30) && (
            <p className={styles.warning}>
              Resultados exploratorios: se necesitan al menos 30 observaciones
              por mecanismo y operación para el análisis del informe.
            </p>
          )}
          {unidentified > 0 && (
            <p>
              Hay {unidentified} solicitudes sin un mecanismo identificable; no
              se atribuyen a ninguno de los cuatro mecanismos.
            </p>
          )}
          <p>
            Latencia total de las solicitudes, en milisegundos. Se reúnen las
            muestras individuales de la misma operación; no se promedian
            medianas ni percentiles. Desviación estándar poblacional.
          </p>
          {hasData ? (
            <div
              className={styles.chartScroll}
              role="group"
              aria-label="Gráfico de latencias por mecanismo"
            >
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height={340} minWidth={0}>
                  <BarChart
                    data={rows}
                    accessibilityLayer
                    margin={{ top: 20, right: 20, bottom: 20, left: 12 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis unit=" ms" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="median_ms"
                      name="Mediana (ms)"
                      fill="#254ad7"
                      isAnimationActive={false}
                      onClick={(entry) => {
                        const row = rows[entry.originalDataIndex];
                        if (row?.n) setSelectedMechanism(row.mechanism);
                      }}
                    />
                    <Bar
                      dataKey="p95_ms"
                      name="P95 (ms)"
                      fill="#7c3aed"
                      isAnimationActive={false}
                      onClick={(entry) => {
                        const row = rows[entry.originalDataIndex];
                        if (row?.n) setSelectedMechanism(row.mechanism);
                      }}
                    />
                    <Bar
                      dataKey="stddev_ms"
                      name="Desviación estándar (ms)"
                      fill="#b65d08"
                      isAnimationActive={false}
                      onClick={(entry) => {
                        const row = rows[entry.originalDataIndex];
                        if (row?.n) setSelectedMechanism(row.mechanism);
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p>No hay muestras válidas para los filtros seleccionados.</p>
          )}
          <div className={table.tableWrap}>
            <table className={table.table}>
              <caption>Latencias por mecanismo · {operation}</caption>
              <thead>
                <tr>
                  {[
                    "Mecanismo",
                    "Mediana (ms)",
                    "P95 (ms)",
                    "Desviación estándar (ms)",
                    "N",
                  ].map((label) => (
                    <th scope="col" key={label}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.mechanism}>
                    <th scope="row">{row.label}</th>
                    <td>{row.median_ms ?? "Sin datos"}</td>
                    <td>{row.p95_ms ?? "Sin datos"}</td>
                    <td>{row.stddev_ms ?? "Sin datos"}</td>
                    <td>{row.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Selecciona una barra para consultar sus métricas individuales.
            También puedes usar estos botones:
          </p>
          <div className={styles.choices}>
            {rows.map((row) => (
              <button
                key={row.mechanism}
                type="button"
                disabled={!row.n}
                aria-pressed={selectedMechanism === row.mechanism}
                onClick={() => setSelectedMechanism(row.mechanism)}
              >
                Ver métricas de {row.label}
              </button>
            ))}
          </div>
          {detail && detail.n > 0 && (
            <section
              className={styles.detail}
              aria-label={`Detalle de latencias de ${detail.label}`}
            >
              <h3>Métricas individuales · {detail.label}</h3>
              <MetricTable metrics={detail.samples} />
            </section>
          )}
        </>
      )}
    </section>
  );
}
