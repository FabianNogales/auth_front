import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { isApiError } from "../../../shared/services/ApiError.ts";
import { jwtAuthService } from "../services/jwtAuthService.ts";
import { useSessionStore } from "./useSessionStore.ts";

/**
 * Revoca el token JWT activo y limpia la sesión local.
 *
 * - 204 → "Sesión cerrada correctamente".
 * - 401/409 → "La sesión ya estaba cerrada" (token ya revocado o inválido).
 * - Otro error de red → mensaje genérico, pero igual limpiamos sesión
 *   (fail-open: no dejamos al usuario atrapado si el backend no responde).
 *
 * Tras `logout()`, `ProtectedRoute` redirige al formulario de login.
 */
export function useRevokeJwt() {
  const logout = useSessionStore((state) => state.logout);

  return useMutation({
    mutationFn: (token: string) => jwtAuthService.revoke(token),
    onSuccess: () => {
      toast.success("Sesión cerrada correctamente");
      logout();
    },
    onError: (error: unknown) => {
      if (isApiError(error) && (error.isUnauthorized || error.status === 409)) {
        toast.info("La sesión ya estaba cerrada");
      } else {
        toast.error("No se pudo cerrar la sesión.");
      }
      logout();
    },
  });
}
