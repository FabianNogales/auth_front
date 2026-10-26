import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { isApiError } from "../../../shared/services/ApiError.ts";
import { httpClient } from "../../../shared/services/httpClient.ts";
import { basicAuthHeaders } from "../../../shared/services/authHeaders.ts";
import { basicAuthService } from "../services/basicAuthService.ts";
import { useSessionStore } from "./useSessionStore.ts";

/** Respuesta de `GET /users/me` (contrato de `UserController::me`). */
interface MeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
  };
  roles: Array<{
    name: string;
    description: string | null;
    is_system: boolean;
    permissions: string[];
  }>;
  permissions: string[];
}

/**
 * Login Basic: verifica identidad, guarda sesión y avisa por toast.
 * El backend responde 401 bare tanto para email inexistente como para
 * password mala (indistinguible a propósito) → "Credenciales incorrectas".
 *
 * Tras el login, consulta `/users/me` con Basic Auth para hidratar roles
 * y permisos efectivos en el store (necesarios para el sidebar).
 */
export function useBasicLogin() {
  const loginBasic = useSessionStore((state) => state.loginBasic);

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      basicAuthService.login(credentials),
    onSuccess: async (response, credentials) => {
      loginBasic(credentials.email, credentials.password, response.user);
      toast.success("Sesión iniciada", {
        description: `Bienvenido, ${response.user.name}.`,
      });

      // Hidratar roles/permisos. Usamos httpClient + basicAuthHeaders
      try {
        const { data } = await httpClient.get<MeResponse>("/users/me", {
          headers: basicAuthHeaders(credentials.email, credentials.password),
        });
        useSessionStore.getState().setRoles(data.roles.map((r) => r.name));
        useSessionStore.getState().setPermissions(data.permissions);
      } catch {
        // Silencioso: la sesión sigue válida aunque /me falle.
      }
    },
    onError: (error: unknown) => {
      if (isApiError(error) && error.isUnauthorized) {
        toast.error("Credenciales incorrectas.");
        return;
      }
      toast.error("No se pudo iniciar sesión.");
    },
  });
}
