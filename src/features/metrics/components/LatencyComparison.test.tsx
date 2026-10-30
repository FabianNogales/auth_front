import { cloneElement, type ReactElement } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { LatencyComparison } from "./LatencyComparison.tsx";
import { downloadCsv } from "../../experiments/utils/credentialSizes.ts";
import type { LatencySource } from "../utils/latencyComparison.ts";
vi.mock("../../experiments/utils/credentialSizes.ts", () => ({
  downloadCsv: vi.fn(),
}));
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({
      children,
    }: {
      children: ReactElement<{ width?: number; height?: number }>;
    }) => <div>{cloneElement(children, { width: 800, height: 340 })}</div>,
  };
});
const source: LatencySource = {
  experimentId: 11,
  comparison: { rows: [], losses: 0, valid: true },
  metrics: [
    {
      id: 1,
      mechanism: "oauth",
      operation: "GET api/tickets",
      http_status: 200,
      latency_ms: 10,
      auth_ms: 2,
      credential_size: 71,
      occurred_at: "2026-10-30T12:00:00Z",
      failed_layer: null,
    },
    {
      id: 2,
      mechanism: "oauth",
      operation: "GET api/tickets",
      http_status: 401,
      latency_ms: 30,
      auth_ms: 3,
      credential_size: 71,
      occurred_at: "2026-10-30T12:00:01Z",
      failed_layer: null,
    },
  ],
};
it("presenta cuatro mecanismos, tabla, selección individual y exportación", () => {
  render(
    <LatencyComparison
      sources={[source]}
      selectedCount={1}
      excludedCount={0}
      loading={false}
      failed={false}
    />,
  );
  const table = screen.getByRole("table", {
    name: "Latencias por mecanismo · GET api/tickets",
  });
  expect(within(table).getAllByRole("row")).toHaveLength(5);
  expect(
    screen.getByRole("group", { name: "Gráfico de latencias por mecanismo" }),
  ).toBeVisible();
  expect(screen.getByText(/Resultados exploratorios/)).toBeVisible();
  fireEvent.click(
    screen.getByRole("button", { name: "Ver métricas de OAuth 2.0" }),
  );
  const detail = screen.getByRole("region", {
    name: "Detalle de latencias de OAuth 2.0",
  });
  expect(within(detail).getAllByRole("row")).toHaveLength(3);
  expect(
    within(detail).getByRole("columnheader", { name: "Fecha" }),
  ).toBeVisible();
  expect(within(detail).getByRole("cell", { name: "Rechazada" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Exportar resultados" }));
  expect(downloadCsv).toHaveBeenCalledWith(
    "comparacion-latencias.csv",
    expect.stringContaining('"OAuth 2.0"'),
  );
  fireEvent.change(screen.getByLabelText("Respuestas HTTP"), {
    target: { value: "200" },
  });
  expect(
    screen.queryByRole("region", { name: "Detalle de latencias de OAuth 2.0" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Ver métricas de OAuth 2.0" }),
  );
  expect(
    within(
      screen.getByRole("region", { name: "Detalle de latencias de OAuth 2.0" }),
    ).getAllByRole("row"),
  ).toHaveLength(2);
});
it("comunica ausencia de datos y no habilita una exportación vacía", () => {
  render(
    <LatencyComparison
      sources={[{ ...source, metrics: [] }]}
      selectedCount={1}
      excludedCount={0}
      loading={false}
      failed={false}
    />,
  );
  expect(
    screen.getByText("Este experimento no tiene datos registrados"),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Exportar resultados" }),
  ).toBeDisabled();
});
it("identifica las pérdidas y no presenta una carga parcial como comparación completa", () => {
  const { rerender } = render(
    <LatencyComparison
      sources={[
        { ...source, comparison: { rows: [], losses: 2, valid: false } },
      ]}
      selectedCount={1}
      excludedCount={0}
      loading={false}
      failed={false}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Comparación no válida");
  expect(screen.getByRole("alert")).toHaveTextContent("2 pérdidas");
  rerender(
    <LatencyComparison
      sources={[source]}
      selectedCount={2}
      excludedCount={0}
      loading={false}
      failed
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "No se muestran resultados parciales",
  );
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Exportar resultados" }),
  ).toBeDisabled();
});
