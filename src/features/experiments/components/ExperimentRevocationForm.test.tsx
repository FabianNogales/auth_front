import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { ExperimentRevocationForm } from "./ExperimentRevocationForm.tsx";
import { httpClient } from "../../../shared/services/httpClient.ts";
import { useSessionStore } from "../../authentication/hooks/useSessionStore.ts";
vi.mock("../../../shared/services/httpClient.ts", () => ({
  httpClient: { post: vi.fn() },
}));
beforeEach(() => {
  vi.resetAllMocks();
  useSessionStore.getState().logout();
});
const experiments = [
  { id: 1, name: "OAuth de prueba", mechanism: "oauth", status: "RUNNING" },
  { id: 2, name: "API Key de prueba", mechanism: "api_key", status: "RUNNING" },
  { id: 3, name: "Basic de prueba", mechanism: "basic", status: "RUNNING" },
  { id: 4, name: "JWT cerrado", mechanism: "jwt", status: "FINISHED" },
];
it("registra una revocación OAuth con contexto y limpia el token", async () => {
  vi.mocked(httpClient.post).mockResolvedValue({ status: 204 });
  render(<ExperimentRevocationForm experiments={experiments} />);
  fireEvent.click(screen.getByText("Registrar una revocación de prueba"));
  fireEvent.change(screen.getByLabelText("Experimento de la revocación"), {
    target: { value: "1" },
  });
  fireEvent.change(
    screen.getByLabelText("Token de acceso de prueba a revocar"),
    { target: { value: "token-prueba" } },
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "Revocar credencial de prueba y registrar evento",
    }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Revocación registrada",
  );
  expect(httpClient.post).toHaveBeenCalledWith(
    "/auth/oauth/revoke",
    { token: "token-prueba" },
    { headers: { "X-Experiment-Id": "1" } },
  );
  expect(
    screen.getByLabelText("Token de acceso de prueba a revocar"),
  ).toHaveValue("");
  expect(
    screen.queryByRole("option", { name: /Basic de prueba/ }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("option", { name: /JWT cerrado/ }),
  ).not.toBeInTheDocument();
});
it("usa la sesión administradora para revocar por ID sin enviar la API Key objetivo", async () => {
  useSessionStore
    .getState()
    .loginBasic("admin@lab.test", "password", {
      id: "1",
      name: "Admin",
      email: "admin@lab.test",
      is_active: true,
    });
  vi.mocked(httpClient.post).mockResolvedValue({ status: 204 });
  render(<ExperimentRevocationForm experiments={experiments} />);
  fireEvent.click(screen.getByText("Registrar una revocación de prueba"));
  fireEvent.change(screen.getByLabelText("Experimento de la revocación"), {
    target: { value: "2" },
  });
  fireEvent.change(screen.getByLabelText("ID de la API Key de prueba"), {
    target: { value: "71" },
  });
  fireEvent.click(
    screen.getByRole("button", {
      name: "Revocar credencial de prueba y registrar evento",
    }),
  );
  expect(await screen.findByRole("status")).toHaveTextContent(
    "Revocación registrada",
  );
  expect(httpClient.post).toHaveBeenCalledWith(
    "/auth/api-key/revoke/71",
    undefined,
    {
      headers: {
        "X-Experiment-Id": "2",
        Authorization: `Basic ${btoa("admin@lab.test:password")}`,
      },
    },
  );
});
