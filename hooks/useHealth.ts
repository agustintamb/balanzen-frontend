import { useQuery } from "@tanstack/react-query";
import { healthService } from "@/api/health/health.service";
import { HealthResponse } from "@/api/health/health.types";

export const useHealth = () =>
  useQuery<HealthResponse, Error>({
    queryKey: ["health"],
    queryFn: healthService.check,
    retry: 1,
    staleTime: 1000 * 30,
  });
