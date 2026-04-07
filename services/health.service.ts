import apiClient from "@/api/client";
import { HealthResponse } from "@/api/types";

export const healthService = {
  check: (): Promise<HealthResponse> => apiClient.get("/health"),
};
