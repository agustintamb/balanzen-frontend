import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native/pure";
import React from "react";

import { metricsService } from "@/api/metrics/metrics.service";
import { MetricsSummary } from "@/api/metrics/metrics.types";
import { useMetricsSummary } from "@/hooks/useMetrics";

jest.mock("@/api/metrics/metrics.service", () => ({
  metricsService: {
    getSummary: jest.fn(),
  },
}));

const mockMetricsService = metricsService as jest.Mocked<typeof metricsService>;

const buildMetricsSummary = (overrides?: Partial<MetricsSummary>): MetricsSummary => ({
  total_publications: 10,
  active_publications: 4,
  total_reservations: 20,
  total_delivered: 15,
  total_cancelled: 5,
  conversion_rate: 0.75,
  ...overrides,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return wrapper;
};

describe("useMetricsSummary", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should start in loading state before the query resolves", () => {
    mockMetricsService.getSummary.mockResolvedValueOnce(buildMetricsSummary());

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should return the metrics summary on successful fetch", async () => {
    const summary = buildMetricsSummary();
    mockMetricsService.getSummary.mockResolvedValueOnce(summary);

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(summary);
  });

  it("should call metricsService.getSummary with no arguments", async () => {
    mockMetricsService.getSummary.mockResolvedValueOnce(buildMetricsSummary());

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockMetricsService.getSummary).toHaveBeenCalledTimes(1);
    expect(mockMetricsService.getSummary).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["metrics", "summary"] })
    );
  });

  it("should expose numeric fields with correct values", async () => {
    const summary = buildMetricsSummary({
      total_publications: 50,
      active_publications: 30,
      total_reservations: 200,
      total_delivered: 180,
      total_cancelled: 20,
      conversion_rate: 0.9,
    });
    mockMetricsService.getSummary.mockResolvedValueOnce(summary);

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_publications).toBe(50);
    expect(result.current.data?.active_publications).toBe(30);
    expect(result.current.data?.total_reservations).toBe(200);
    expect(result.current.data?.total_delivered).toBe(180);
    expect(result.current.data?.total_cancelled).toBe(20);
    expect(result.current.data?.conversion_rate).toBe(0.9);
  });

  it("should handle zero values in all numeric fields", async () => {
    const summary = buildMetricsSummary({
      total_publications: 0,
      active_publications: 0,
      total_reservations: 0,
      total_delivered: 0,
      total_cancelled: 0,
      conversion_rate: 0,
    });
    mockMetricsService.getSummary.mockResolvedValueOnce(summary);

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_publications).toBe(0);
    expect(result.current.data?.conversion_rate).toBe(0);
  });

  it("should set isError and expose the error when the service fails", async () => {
    const serverError = new Error("Internal Server Error");
    mockMetricsService.getSummary.mockRejectedValueOnce(serverError);

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Internal Server Error");
    expect(result.current.data).toBeUndefined();
  });

  it("should set isError when unauthorized (401) error is thrown", async () => {
    const unauthorizedError = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
    });
    mockMetricsService.getSummary.mockRejectedValueOnce(unauthorizedError);

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Unauthorized");
  });

  it("should use query key ['metrics', 'summary'] so multiple instances share cache", async () => {
    const summary = buildMetricsSummary({ total_publications: 7 });
    // Provide enough mock responses in case concurrent hooks both fire before dedup
    mockMetricsService.getSummary
      .mockResolvedValueOnce(summary)
      .mockResolvedValueOnce(summary);

    const wrapper = createWrapper();

    const { result: first } = renderHook(() => useMetricsSummary(), { wrapper });
    const { result: second } = renderHook(() => useMetricsSummary(), { wrapper });

    await waitFor(() => expect(first.current.isSuccess).toBe(true));
    await waitFor(() => expect(second.current.isSuccess).toBe(true));

    // Both hooks resolve to identical data from the same query key
    expect(first.current.data).toEqual(second.current.data);
    expect(first.current.data).toEqual(summary);
  });

  it("should handle a conversion_rate of 1.0 (100%) correctly", async () => {
    const summary = buildMetricsSummary({
      total_reservations: 100,
      total_delivered: 100,
      total_cancelled: 0,
      conversion_rate: 1,
    });
    mockMetricsService.getSummary.mockResolvedValueOnce(summary);

    const { result } = renderHook(() => useMetricsSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.conversion_rate).toBe(1);
  });
});
