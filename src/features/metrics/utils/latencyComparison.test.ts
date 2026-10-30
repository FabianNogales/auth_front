import { expect, it } from "vitest";
import {
  latencyRows,
  latencyCsv,
  type LatencySource,
} from "./latencyComparison.ts";
const source = (
  id: number,
  values: number[],
  operation = "GET api/tickets",
): LatencySource => ({
  experimentId: id,
  comparison: { rows: [], losses: 0, valid: true },
  metrics: values.map((value, index) => ({
    id: id * 100 + index,
    mechanism: "oauth",
    operation,
    http_status: 200,
    latency_ms: value,
    auth_ms: 1,
    credential_size: 71,
    failed_layer: null,
    occurred_at: "2026-10-30T12:00:00Z",
  })),
});
it("calcula mediana, P95 interpolado y desviación poblacional de las muestras", () => {
  expect(
    latencyRows([source(1, [10, 20, 30, 40, 100])], "GET api/tickets", null)[3],
  ).toMatchObject({ n: 5, median_ms: 30, p95_ms: 88, stddev_ms: 31.62 });
});
it("combina observaciones sin promediar estadísticas de grupos desiguales", () => {
  expect(
    latencyRows(
      [source(1, [0]), source(2, [10, 20, 30])],
      "GET api/tickets",
      null,
    )[3],
  ).toMatchObject({ n: 4, median_ms: 15, p95_ms: 28.5, stddev_ms: 11.18 });
});
it("separa operaciones y respuestas sin convertir ausencia de datos en cero", () => {
  const first = source(1, [0, 20]);
  first.metrics[1].http_status = 401;
  const rows = latencyRows(
    [first, source(2, [1000], "POST api/tickets")],
    "GET api/tickets",
    200,
  );
  expect(rows[3]).toMatchObject({
    n: 1,
    median_ms: 0,
    p95_ms: 0,
    stddev_ms: 0,
  });
  expect(rows[0]).toMatchObject({
    n: 0,
    median_ms: null,
    p95_ms: null,
    stddev_ms: null,
  });
  expect(rows[3].samples[0].experiment_id).toBe(1);
});
it("exporta unidades, filtros, N y calidad con escape CSV correcto", () => {
  const item = source(7, [10], 'GET api/tickets?x="a,b"');
  item.comparison = { rows: [], losses: 2, valid: false };
  const csv = latencyCsv(
    latencyRows([item], item.metrics[0].operation, null),
    [item],
    item.metrics[0].operation,
    null,
  );
  expect(csv).toContain('"P95 (ms)"');
  expect(csv).toContain('"GET api/tickets?x=""a,b"""');
  expect(csv).toContain('"2","No","No"');
});
