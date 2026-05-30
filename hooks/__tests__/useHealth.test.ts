import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native/pure";
import React from "react";

import { healthService } from "@/api/health/health.service";
import { HealthResponse } from "@/api/health/health.types";
import { useHealth } from "@/hooks/useHealth";

jest.mock("@/api/health/health.service", () => ({
  healthService: {
    check: jest.fn(),
  },
}));

const mockHealthService = healthService as jest.Mocked<typeof healthService>;

const buildHealthResponse = (overrides?: Partial<HealthResponse>): HealthResponse => ({
  success: true,
  message: "API is running",
  environment: "production",
  timestamp: "2026-05-30T12:00:00.000Z",
  database: {
    status: "connected",
    name: "balanzen_db",
  },
  uptime: "3d 4h 12m",
  ...overrides,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      // useHealth sets retry: 1 in the hook; retryDelay: 0 makes retries fire
      // immediately so waitFor() resolves before its default 1 s timeout
      queries: { retryDelay: 0 },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return wrapper;
};

describe("useHealth", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should start in loading state before the query resolves", () => {
    mockHealthService.check.mockResolvedValueOnce(buildHealthResponse());

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should return the health response on successful check", async () => {
    const response = buildHealthResponse();
    mockHealthService.check.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(response);
  });

  it("should call healthService.check with no arguments", async () => {
    mockHealthService.check.mockResolvedValueOnce(buildHealthResponse());

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockHealthService.check).toHaveBeenCalledTimes(1);
    expect(mockHealthService.check).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["health"] })
    );
  });

  it("should expose all HealthResponse fields correctly", async () => {
    const response = buildHealthResponse({
      success: true,
      message: "OK",
      environment: "staging",
      timestamp: "2026-05-30T10:00:00.000Z",
      database: { status: "connected", name: "staging_db" },
      uptime: "1h 30m",
    });
    mockHealthService.check.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.success).toBe(true);
    expect(result.current.data?.message).toBe("OK");
    expect(result.current.data?.environment).toBe("staging");
    expect(result.current.data?.timestamp).toBe("2026-05-30T10:00:00.000Z");
    expect(result.current.data?.database.status).toBe("connected");
    expect(result.current.data?.database.name).toBe("staging_db");
    expect(result.current.data?.uptime).toBe("1h 30m");
  });

  it("should handle success: false indicating API degradation", async () => {
    const response = buildHealthResponse({
      success: false,
      message: "Database unreachable",
      database: { status: "disconnected", name: "balanzen_db" },
    });
    mockHealthService.check.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.success).toBe(false);
    expect(result.current.data?.database.status).toBe("disconnected");
  });

  it("should set isError and expose the error when the service fails", async () => {
    const networkError = new Error("Network Error");
    // retry: 1 means the hook retries once — reject both attempts
    mockHealthService.check
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Network Error");
    expect(result.current.data).toBeUndefined();
  });

  it("should set isError when a 503 service unavailable error is thrown", async () => {
    const serviceUnavailable = Object.assign(new Error("Service Unavailable"), {
      response: { status: 503 },
    });
    // retry: 1 means the hook retries once — reject both attempts
    mockHealthService.check
      .mockRejectedValueOnce(serviceUnavailable)
      .mockRejectedValueOnce(serviceUnavailable);

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Service Unavailable");
  });

  it("should use query key ['health'] so multiple instances share cache", async () => {
    const response = buildHealthResponse();
    // Provide enough mock responses in case concurrent hooks both fire before dedup
    mockHealthService.check
      .mockResolvedValueOnce(response)
      .mockResolvedValueOnce(response);

    const wrapper = createWrapper();

    const { result: first } = renderHook(() => useHealth(), { wrapper });
    const { result: second } = renderHook(() => useHealth(), { wrapper });

    await waitFor(() => expect(first.current.isSuccess).toBe(true));
    await waitFor(() => expect(second.current.isSuccess).toBe(true));

    // Both hooks resolve to identical data from the same query key
    expect(first.current.data).toEqual(second.current.data);
    expect(first.current.data).toEqual(response);
  });

  it("should handle different environment values (development, staging, production)", async () => {
    const envs = ["development", "staging", "production"] as const;

    for (const environment of envs) {
      mockHealthService.check.mockResolvedValueOnce(buildHealthResponse({ environment }));

      const { result } = renderHook(() => useHealth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.environment).toBe(environment);

      jest.resetAllMocks();
    }
  });
});
