import { MECHANISM_OPTIONS } from "../types/requestConfiguration.ts";
import type { ExperimentEvidence } from "../services/revocationComparisonService.ts";
export function revocationRows(evidence: ExperimentEvidence[]) {
  return MECHANISM_OPTIONS.map((option) => {
    const samples = evidence
      .filter((item) => item.experiment.mechanism === option.backend)
      .flatMap((item) => {
        const events = item.events
          .filter(
            (event) =>
              event.event_type === "credential_revoked" &&
              event.payload.mechanism === option.backend,
          )
          .sort(
            (a, b) =>
              Date.parse(b.created_at) - Date.parse(a.created_at) ||
              Number(b.payload.after_metric_id ?? 0) -
                Number(a.payload.after_metric_id ?? 0),
          );
        const event = events[0];
        if (!event || !Number.isFinite(Date.parse(event.created_at))) return [];
        return item.metrics.filter((metric) => {
          const timestamp = Date.parse(metric.occurred_at);
          const watermark = event.payload.after_metric_id;
          return (
            Number.isFinite(timestamp) &&
            timestamp >= Date.parse(event.created_at) &&
            (typeof watermark !== "number" || metric.id > watermark) &&
            (metric.mechanism === option.backend || metric.mechanism === "none")
          );
        });
      });
    const codes = [
      ...new Set(samples.map((sample) => sample.http_status)),
    ].sort((a, b) => a - b);
    let state = "Sin evidencia posterior";
    let description =
      "Falta una revocación registrada o solicitudes posteriores. No se infiere el resultado.";
    if (option.backend === "basic") {
      state = "No aplica revocación de token";
      description =
        "Basic usa correo y contraseña. Quitar un rol puede causar 403, pero no revoca la credencial.";
    } else if (codes.length) {
      const accepted = codes.some(
        (code) => (code >= 200 && code < 300) || code === 403,
      );
      const rejected = codes.includes(401);
      state =
        accepted && rejected
          ? "Resultados mixtos"
          : rejected
            ? "Rechazada en autenticación"
            : accepted
              ? "Autenticación aceptada"
              : "No concluyente";
      description =
        accepted && rejected
          ? "Se observaron respuestas diferentes; revisa las credenciales y operaciones del experimento."
          : rejected
            ? "Se observó 401 después del evento de revocación. La solicitud no se autenticó."
            : codes.includes(403)
              ? "Se observó 403: el acceso fue denegado por autorización; no equivale a una credencial revocada."
              : accepted
                ? "La solicitud obtuvo acceso después del evento de revocación."
                : "El código observado no permite determinar el estado de autenticación.";
    }
    return {
      mechanism: option.backend,
      label: option.label,
      codes: codes.join(", ") || "—",
      state,
      description,
      count: samples.length,
    };
  });
}
