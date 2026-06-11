import { useQuery } from "@tanstack/react-query";
import { metricsService } from "@/api/metrics/metrics.service";
import { MetricsSummary } from "@/api/metrics/metrics.types";

export const useMetricsSummary = () =>
  useQuery<MetricsSummary, Error>({
    queryKey: ["metrics", "summary"],
    queryFn: metricsService.getSummary,
    staleTime: 1000 * 60 * 5,
  });
