import apiClient from "@/api/client";
import { MetricsSummary } from "@/api/metrics/metrics.types";

export const metricsService = {
  getSummary: (): Promise<MetricsSummary> => apiClient.get("/metrics/summary"),
};
