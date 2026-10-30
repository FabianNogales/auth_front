import { isAxiosError } from "axios";
import { httpClient } from "../../../shared/services/httpClient.ts";
import {
  apiKeyHeaders,
  basicAuthHeaders,
  bearerHeaders,
  experimentHeaders,
} from "../../../shared/services/authHeaders.ts";
import { ApiError } from "../../../shared/services/ApiError.ts";
import type { RequestCredentials } from "../types/requestConfiguration.ts";
export function requestHeaders(
  credentials: RequestCredentials,
): Record<string, string> {
  switch (credentials.mechanism) {
    case "API_KEY":
      return apiKeyHeaders(credentials.apiKey.trim());
    case "BASIC":
      return basicAuthHeaders(credentials.email.trim(), credentials.password);
    case "JWT":
      return bearerHeaders(credentials.token.trim(), "jwt");
    case "OAUTH2":
      return bearerHeaders(credentials.token.trim(), "oauth");
  }
}
export const protectedRequestService = {
  async send(credentials: RequestCredentials, experimentId: number | null) {
    try {
      const response = await httpClient.get<unknown>("/tickets", {
        headers: {
          ...requestHeaders(credentials),
          ...experimentHeaders(experimentId),
        },
        validateStatus: (status) => status >= 200 && status < 500,
      });
      return { status: response.status, data: response.data };
    } catch (error: unknown) {
      throw new ApiError(
        "No se pudo enviar la solicitud. Comprueba la conexión.",
        {
          status: isAxiosError(error) ? error.response?.status : undefined,
        },
      );
    }
  },
};
