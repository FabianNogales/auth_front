import type { Metric, MetricComparison } from "../types/metric.ts";
import { MECHANISM_OPTIONS } from "../../experiments/types/requestConfiguration.ts";

export interface LatencySource {
  experimentId: number;
  metrics: Metric[];
  comparison: MetricComparison;
}
export type LatencySample = Metric & { experiment_id: number };
export interface LatencyRow {
  mechanism: string;
  label: string;
  n: number;
  median_ms: number | null;
  p95_ms: number | null;
  stddev_ms: number | null;
  samples: LatencySample[];
}
const round = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
function percentile(sorted: number[], percent: number): number {
  const rank = (percent / 100) * (sorted.length - 1);
  const low = Math.floor(rank);
  return round(
    sorted[low] + (sorted[Math.ceil(rank)] - sorted[low]) * (rank - low),
  );
}

/** Pool individual observations, never average medians or percentiles across experiments. */
export function latencyRows(
  sources: LatencySource[],
  operation: string,
  status: number | null,
): LatencyRow[] {
  const samples = sources
    .flatMap((source) =>
      source.metrics.map((metric) => ({
        ...metric,
        experiment_id: source.experimentId,
      })),
    )
    .filter(
      (metric) =>
        metric.operation === operation &&
        (status === null || metric.http_status === status) &&
        Number.isFinite(metric.latency_ms) &&
        metric.latency_ms >= 0,
    );
  return MECHANISM_OPTIONS.map((option) => {
    const group = samples.filter(
      (sample) => sample.mechanism === option.backend,
    );
    const values = group
      .map((sample) => sample.latency_ms)
      .sort((a, b) => a - b);
    if (!values.length)
      return {
        mechanism: option.backend,
        label: option.label,
        n: 0,
        median_ms: null,
        p95_ms: null,
        stddev_ms: null,
        samples: [],
      };
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      values.length;
    return {
      mechanism: option.backend,
      label: option.label,
      n: values.length,
      median_ms: percentile(values, 50),
      p95_ms: percentile(values, 95),
      stddev_ms: round(Math.sqrt(variance)),
      samples: group,
    };
  });
}

function csvCell(value: string | number): string {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}
export function latencyCsv(
  rows: LatencyRow[],
  sources: LatencySource[],
  operation: string,
  status: number | null,
): string {
  const losses = sources.reduce(
    (sum, source) => sum + source.comparison.losses,
    0,
  );
  const valid =
    losses === 0 && sources.every((source) => source.comparison.valid);
  return [
    [
      "Mecanismo",
      "Operación",
      "Filtro HTTP",
      "Mediana (ms)",
      "P95 (ms)",
      "Desviación estándar (ms)",
      "N",
      "Experimentos",
      "Pérdidas",
      "Registro válido",
      "N >= 30",
    ],
    ...rows.map((row) => [
      row.label,
      operation,
      status ?? "Todos",
      row.median_ms ?? "",
      row.p95_ms ?? "",
      row.stddev_ms ?? "",
      row.n,
      sources.map((source) => source.experimentId).join(";"),
      losses,
      valid ? "Sí" : "No",
      row.n >= 30 ? "Sí" : "No",
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
