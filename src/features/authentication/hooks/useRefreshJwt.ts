import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { isApiError } from "../../../shared/services/ApiError.ts";
import { jwtAuthService } from "../services/jwtAuthService.ts";
import { useSessionStore } from "./useSessionStore.ts";

/**
 * Renueva el token JWT (rotación: el token anterior deja de ser válido).
 *
 * Cualquier 401 cae en el mensaje que piden los criterios de HU2:
 * "Tu sesión ha expirado, por favor inicia sesión nuevamente." — cubre
 * expirado, revocado y reuso de un token ya rotado (mismo status por
 * contrato del backend).
 */
export function useRefreshJwt() {
  const setJwtToken = useSessionStore((state) => state.setJwtToken);

  return useMutation({
    mutationFn: (token: string) => jwtAuthService.refresh(token),
    onSuccess: (data) => {
      setJwtToken(data.token);
      toast.success("Token renovado correctamente", {
        description:
          "El token anterior ya no es válido para futuras solicitudes.",
      });
    },
    onError: (error: unknown) => {
      if (isApiError(error) && error.isUnauthorized) {
        toast.error(
          "Tu sesión ha expirado, por favor inicia sesión nuevamente.",
        );
        return;
      }
      toast.error("No se pudo renovar el token.");
    },
  });
}
