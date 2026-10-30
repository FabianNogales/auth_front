import { fireEvent, render as renderUi, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metricsService } from '../../metrics/services/metricsService.ts';
vi.mock('../../metrics/services/metricsService.ts',()=>({metricsService:{get:vi.fn()}}));
function render(ui:ReactNode) { return renderUi(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>{ui}</QueryClientProvider>); }
import { MemoryRouter } from "react-router";
import { beforeEach, expect, it, vi } from "vitest";
import { ProtectedRequestPage } from "./ProtectedRequestPage.tsx";
import { RevocationComparisonPage } from "./RevocationComparisonPage.tsx";
import { protectedRequestService } from "../services/protectedRequestService.ts";
import { revocationComparisonService } from "../services/revocationComparisonService.ts";
import { useSessionStore } from "../../authentication/hooks/useSessionStore.ts";
import { experimentService } from "../services/experimentService.ts";
vi.mock("../services/experimentService.ts", () => ({
  experimentService: { list: vi.fn() },
}));
vi.mock("../services/protectedRequestService.ts", () => ({
  protectedRequestService: { send: vi.fn() },
}));
vi.mock("../services/revocationComparisonService.ts", () => ({
  revocationComparisonService: { experiments: vi.fn(), evidence: vi.fn() },
}));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(metricsService.get).mockResolvedValue({metrics:[],comparison:{rows:[],losses:0,valid:true}});
  vi.mocked(experimentService.list).mockResolvedValue([
    {
      id: 12,
      name: "Prueba OAuth",
      mechanism: "oauth",
      status: "RUNNING",
      test_user_id: "42",
      resources: ["tickets.list"],
      created_at: null,
      started_at: null,
      finished_at: null,
    },
  ]);
  useSessionStore.getState().setPermissions(["ADMIN"]);
});
it("adapta los campos y elimina credenciales al cambiar de mecanismo", () => {
  render(
    <MemoryRouter>
      <ProtectedRequestPage />
    </MemoryRouter>,
  );
  fireEvent.change(
    screen.getByLabelText("API Key", { selector: "input[type=password]" }),
    { target: { value: "secreto-anterior" } },
  );
  fireEvent.click(screen.getByRole("radio", { name: "Basic" }));
  expect(
    screen.queryByDisplayValue("secreto-anterior"),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("Correo electrónico")).toBeVisible();
  expect(screen.getByLabelText("Contraseña")).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: "JWT" }));
  expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Token JWT")).toBeVisible();
  fireEvent.click(screen.getByRole("radio", { name: "OAuth 2.0" }));
  expect(screen.queryByLabelText("Token JWT")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Token OAuth")).toBeVisible();
  expect(screen.getByLabelText("Mecanismo adicional")).toHaveValue("oauth");
  fireEvent.click(screen.getByRole("radio", { name: "API Key" }));
  expect(
    screen.getByLabelText("API Key", { selector: "input[type=password]" }),
  ).toHaveValue("");
});
it("recibe el experimento desde el listado y limpia su asociación al cambiar de mecanismo", async () => {
  render(
    <MemoryRouter initialEntries={["/solicitudes/configurar?experimentId=12"]}>
      <ProtectedRequestPage />
    </MemoryRouter>,
  );
  await waitFor(() =>
    expect(screen.getByLabelText("Experimento (opcional)")).toHaveValue("12"),
  );
  expect(screen.getByRole("radio", { name: "OAuth 2.0" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "JWT" }));
  expect(screen.getByLabelText("Experimento (opcional)")).toHaveValue("");
  expect(
    screen.queryByRole("option", { name: "#12 · Prueba OAuth" }),
  ).not.toBeInTheDocument();
});
it("envía únicamente la configuración elegida y distingue 401 de 403", async () => {
  vi.mocked(protectedRequestService.send)
    .mockResolvedValueOnce({ status: 401, data: { error: "unauthenticated" } })
    .mockResolvedValueOnce({ status: 403, data: { layer: "rbac" } });
  render(
    <MemoryRouter>
      <ProtectedRequestPage />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
  expect(protectedRequestService.send).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("radio", { name: "OAuth 2.0" }));
  fireEvent.change(screen.getByLabelText("Token OAuth"), {
    target: { value: "token-prueba" },
  });
  await screen.findByRole("option", { name: "#12 · Prueba OAuth" });
  fireEvent.change(screen.getByLabelText("Experimento (opcional)"), {
    target: { value: "12" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
  expect(await screen.findByText("No autenticado")).toBeVisible();
  expect(protectedRequestService.send).toHaveBeenCalledWith(
    { mechanism: "OAUTH2", token: "token-prueba", discriminator: "oauth" },
    12,
  );
  fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
  expect(
    await screen.findByText("No tienes permisos para acceder a este recurso"),
  ).toBeVisible();
});
it("muestra evidencia real y no inventa resultados para mecanismos sin muestras", async () => {
  const experiment = {
    id: 9,
    name: "Revocación aislada",
    mechanism: "oauth",
    status: "FINISHED",
  };
  vi.mocked(revocationComparisonService.experiments).mockResolvedValue([
    experiment,
  ]);
  vi.mocked(revocationComparisonService.evidence).mockResolvedValue({
    experiment,
    events: [
      {
        event_type: "credential_revoked",
        payload: { mechanism: "oauth", after_metric_id: 1 },
        created_at: "2026-10-29T12:00:00Z",
      },
    ],
    metrics: [
      {
        id: 2,
        mechanism: "none",
        operation: "GET api/tickets",
        http_status: 401,
        failed_layer: null,
        occurred_at: "2026-10-29T12:00:01Z",
      },
    ],
  });
  render(
    <MemoryRouter>
      <RevocationComparisonPage />
    </MemoryRouter>,
  );
  fireEvent.click(await screen.findByRole("checkbox"));
  fireEvent.click(
    screen.getByRole("button", { name: "Actualizar comparación" }),
  );
  await waitFor(() =>
    expect(screen.getByRole("cell", { name: "401" })).toBeVisible(),
  );
  expect(screen.getByText("Rechazada en autenticación")).toBeVisible();
  expect(screen.getAllByText("Sin evidencia posterior")).toHaveLength(2);
  expect(screen.getByText("No aplica revocación de token")).toBeVisible();
});
