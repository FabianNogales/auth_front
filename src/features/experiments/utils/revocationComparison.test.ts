import { expect, it } from "vitest";
import { revocationRows } from "./revocationComparison.ts";
import type { ExperimentEvidence } from "../services/revocationComparisonService.ts";
const fixture: ExperimentEvidence = {
  experiment: {
    id: 1,
    name: "Prueba",
    mechanism: "api_key",
    status: "RUNNING",
  },
  events: [
    {
      event_type: "credential_revoked",
      payload: { mechanism: "api_key", after_metric_id: 2 },
      created_at: "2026-10-29T12:00:00Z",
    },
  ],
  metrics: [
    {
      id: 1,
      mechanism: "api_key",
      http_status: 200,
      operation: "GET api/tickets",
      failed_layer: null,
      occurred_at: "2026-10-29T11:59:00Z",
    },
    {
      id: 2,
      mechanism: "api_key",
      http_status: 200,
      operation: "GET api/tickets",
      failed_layer: null,
      occurred_at: "2026-10-29T12:00:00Z",
    },
    {
      id: 3,
      mechanism: "none",
      http_status: 401,
      operation: "GET api/tickets",
      failed_layer: null,
      occurred_at: "2026-10-29T12:00:00Z",
    },
  ],
};
it("excluye métricas previas incluso si comparten segundo y atribuye none solo al experimento", () => {
  const rows = revocationRows([fixture]);
  expect(rows[0]).toMatchObject({
    codes: "401",
    count: 1,
    state: "Rechazada en autenticación",
  });
  expect(rows[2].count).toBe(0);
  expect(rows[3].count).toBe(0);
});
it("no usa role_change como prueba de revocación ni inventa resultados", () => {
  expect(
    revocationRows([
      {
        ...fixture,
        events: [{ ...fixture.events[0], event_type: "role_change" }],
      },
    ])[0].codes,
  ).toBe("—");
  expect(revocationRows([])).toHaveLength(4);
});
it("muestra resultados mixtos sin escoger solo el último 401", () => {
  const extra = {
    ...fixture.metrics[2],
    id: 4,
    http_status: 403,
    failed_layer: "rbac",
  };
  expect(
    revocationRows([{ ...fixture, metrics: [...fixture.metrics, extra] }])[0],
  ).toMatchObject({ codes: "401, 403", state: "Resultados mixtos" });
});
