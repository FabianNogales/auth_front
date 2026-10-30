import { beforeEach, expect, it, vi } from "vitest";
import { httpClient } from "../../../shared/services/httpClient.ts";
import {
  protectedRequestService,
  requestHeaders,
} from "./protectedRequestService.ts";
vi.mock("../../../shared/services/httpClient.ts", () => ({
  httpClient: { get: vi.fn() },
}));
beforeEach(() => vi.resetAllMocks());
it("envía un único mecanismo con el discriminador OAuth obligatorio", () => {
  expect(requestHeaders({ mechanism: "API_KEY", apiKey: " key " })).toEqual({
    "X-API-Key": "key",
  });
  expect(
    requestHeaders({
      mechanism: "BASIC",
      email: "user@lab.test",
      password: "pass",
    }),
  ).toEqual({ Authorization: `Basic ${btoa("user@lab.test:pass")}` });
  expect(requestHeaders({ mechanism: "JWT", token: " jwt " })).toEqual({
    Authorization: "Bearer jwt",
    "X-Auth-Mechanism": "jwt",
  });
  expect(
    requestHeaders({
      mechanism: "OAUTH2",
      token: " oauth ",
      discriminator: "oauth",
    }),
  ).toEqual({ Authorization: "Bearer oauth", "X-Auth-Mechanism": "oauth" });
});
it("asocia la solicitud a un experimento sin cambiar el recurso", async () => {
  vi.mocked(httpClient.get).mockResolvedValue({
    status: 401,
    data: { error: "unauthenticated" },
  });
  expect(
    await protectedRequestService.send(
      { mechanism: "API_KEY", apiKey: "key" },
      7,
    ),
  ).toEqual({ status: 401, data: { error: "unauthenticated" } });
  expect(httpClient.get).toHaveBeenCalledWith(
    "/tickets",
    expect.objectContaining({
      headers: { "X-API-Key": "key", "X-Experiment-Id": "7" },
    }),
  );
});
it("no conserva secretos en el error", async () => {
  vi.mocked(httpClient.get).mockRejectedValue({
    config: { headers: { Authorization: "Bearer secreto" } },
  });
  try {
    await protectedRequestService.send(
      { mechanism: "JWT", token: "secreto" },
      null,
    );
  } catch (error) {
    expect(JSON.stringify(error)).not.toContain("secreto");
    expect(error).not.toHaveProperty("config");
  }
});
