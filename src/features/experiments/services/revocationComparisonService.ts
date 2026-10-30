import { httpClient } from "../../../shared/services/httpClient.ts";
import { ApiError } from "../../../shared/services/ApiError.ts";
export interface ExperimentSummary {
  id: number;
  name: string;
  mechanism: string;
  status: string;
}
export interface ExperimentMetric {
  id: number;
  mechanism: string;
  operation: string;
  http_status: number;
  failed_layer: string | null;
  occurred_at: string;
}
export interface ExperimentEvent {
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}
export interface ExperimentEvidence {
  experiment: ExperimentSummary;
  metrics: ExperimentMetric[];
  events: ExperimentEvent[];
}
export const revocationComparisonService = {
  async experiments(): Promise<ExperimentSummary[]> {
    try {
      return (await httpClient.get<ExperimentSummary[]>("/experiments")).data;
    } catch {
      throw new ApiError("No se pudieron cargar los experimentos");
    }
  },
  async evidence(experiment: ExperimentSummary): Promise<ExperimentEvidence> {
    try {
      const [metrics, events] = await Promise.all([
        httpClient.get<ExperimentMetric[]>(
          `/experiments/${experiment.id}/metrics`,
        ),
        httpClient.get<ExperimentEvent[]>(
          `/experiments/${experiment.id}/events`,
        ),
      ]);
      return { experiment, metrics: metrics.data, events: events.data };
    } catch {
      throw new ApiError(
        "No se pudieron cargar las evidencias del experimento",
      );
    }
  },
};
