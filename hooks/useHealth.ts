import { healthService } from "@/services/health.service";
import { useQuery } from "@tanstack/react-query";

export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: healthService.check,
    retry: 1,
    staleTime: 1000 * 30,
  });
};
