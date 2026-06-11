import { useRouter } from "expo-router";
import { useMetricsSummary } from "@/hooks/useMetrics";

export const useMetricsScreen = () => {
  const router = useRouter();
  const { data, isLoading, refetch } = useMetricsSummary();

  const handleBack = () => {
    router.back();
  };

  const metrics = data;

  return {
    metrics,
    isLoading,
    handleBack,
    refetch,
  };
};

export default function _() {
  return null;
}
