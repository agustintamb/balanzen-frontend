import { act, renderHook } from "@testing-library/react-native";
import { useMetricsSummary } from "@/hooks/useMetrics";
import useMetricsDefaultExport, { useMetricsScreen } from "../useMetricsScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

jest.mock("@/hooks/useMetrics", () => ({
  useMetricsSummary: jest.fn(),
}));

const mockBack = jest.fn();
const mockRefetch = jest.fn();

const MOCK_METRICS = {
  active_publications: 5,
  total_reservations: 20,
  total_delivered: 15,
  total_cancelled: 2,
};

const setupMocks = (data = MOCK_METRICS, isLoading = false) => {
  const { useRouter } = require("expo-router");
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  (useMetricsSummary as jest.Mock).mockReturnValue({
    data,
    isLoading,
    refetch: mockRefetch,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

describe("useMetricsScreen", () => {
  describe("data derivation", () => {
    it("exposes metrics data", () => {
      const { result } = renderHook(() => useMetricsScreen());
      expect(result.current.metrics).toEqual(MOCK_METRICS);
    });

    it("exposes isLoading state", () => {
      setupMocks(undefined as any, true);
      const { result } = renderHook(() => useMetricsScreen());
      expect(result.current.isLoading).toBe(true);
    });

    it("exposes refetch function", () => {
      const { result } = renderHook(() => useMetricsScreen());
      expect(result.current.refetch).toBe(mockRefetch);
    });

    it("metrics is undefined when data is undefined", () => {
      (useMetricsSummary as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        refetch: mockRefetch,
      });
      const { result } = renderHook(() => useMetricsScreen());
      expect(result.current.metrics).toBeUndefined();
    });
  });

  describe("handleBack", () => {
    it("calls router.back()", () => {
      const { result } = renderHook(() => useMetricsScreen());
      act(() => {
        result.current.handleBack();
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useMetricsDefaultExport()).toBeNull();
    });
  });
});
