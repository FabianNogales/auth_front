import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { isApiError } from "../../../shared/services/ApiError.ts";
import { httpClient } from "../../../shared/services/httpClient.ts";
import { bearerHeaders } from "../../../shared/services/authHeaders.ts";
import { jwtAuthService } from "../services/jwtAuthService.ts";
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
 * Login JWT: verifica identidad (email+password), guarda el token y el usuario
 * y redirige. El backend responde 401 bare para credenciales inválidas.
 *
 * Después del login se consulta `/users/me` para popular roles y permisos
 * efectivos. El permiso top-level (`permissions`) es la unión deduplicada de
 * todos los roles — se usa para filtrar el sidebar.
 */
export function useJwtLogin() {
  const loginJwt = useSessionStore((state) => state.loginJwt);

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      jwtAuthService.login(credentials),
    onSuccess: async (response) => {
      loginJwt(response.token, response.user);
      toast.success("Sesión iniciada", {
        description: `Bienvenido, ${response.user.name}.`,
      });

      // Hidratar roles/permisos desde /me. No es bloqueante: si falla,
      // el sidebar solo mostrará las tabs sin restricción de permiso.
      try {
        const { data } = await httpClient.get<MeResponse>("/users/me", {
          headers: bearerHeaders(response.token),
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
