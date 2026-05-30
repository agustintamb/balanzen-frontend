import apiClient from "@/api/client";
import { metricsService } from "@/api/metrics/metrics.service";
import { MetricsSummary } from "@/api/metrics/metrics.types";

jest.mock("@/api/client", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const buildMetricsSummary = (
  overrides?: Partial<MetricsSummary>
): MetricsSummary => ({
  total_publications: 20,
  active_publications: 8,
  total_reservations: 50,
  total_delivered: 40,
  total_cancelled: 10,
  conversion_rate: 0.8,
  ...overrides,
});

describe("metricsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSummary", () => {
    it("should call GET /metrics/summary", async () => {
      const response = buildMetricsSummary();
      mockedApiClient.get.mockResolvedValueOnce(response);

      await metricsService.getSummary();

      expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockedApiClient.get).toHaveBeenCalledWith("/metrics/summary");
    });

    it("should return the MetricsSummary from the API response", async () => {
      const response = buildMetricsSummary();
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await metricsService.getSummary();

      expect(result).toEqual(response);
    });

    it("should return correct total_publications value", async () => {
      const response = buildMetricsSummary({ total_publications: 35 });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await metricsService.getSummary();

      expect(result.total_publications).toBe(35);
    });

    it("should return correct active_publications value", async () => {
      const response = buildMetricsSummary({ active_publications: 12 });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await metricsService.getSummary();

      expect(result.active_publications).toBe(12);
    });

    it("should return correct conversion_rate as a decimal between 0 and 1", async () => {
      const response = buildMetricsSummary({ conversion_rate: 0.65 });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await metricsService.getSummary();

      expect(result.conversion_rate).toBe(0.65);
      expect(result.conversion_rate).toBeGreaterThanOrEqual(0);
      expect(result.conversion_rate).toBeLessThanOrEqual(1);
    });

    it("should return zero values when the commerce has no activity", async () => {
      const response = buildMetricsSummary({
        total_publications: 0,
        active_publications: 0,
        total_reservations: 0,
        total_delivered: 0,
        total_cancelled: 0,
        conversion_rate: 0,
      });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await metricsService.getSummary();

      expect(result.total_publications).toBe(0);
      expect(result.active_publications).toBe(0);
      expect(result.total_reservations).toBe(0);
      expect(result.total_delivered).toBe(0);
      expect(result.total_cancelled).toBe(0);
      expect(result.conversion_rate).toBe(0);
    });

    it("should return a 100% conversion rate when all reservations were delivered", async () => {
      const response = buildMetricsSummary({
        total_reservations: 100,
        total_delivered: 100,
        total_cancelled: 0,
        conversion_rate: 1,
      });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await metricsService.getSummary();

      expect(result.conversion_rate).toBe(1);
      expect(result.total_cancelled).toBe(0);
    });

    it("should contain all required MetricsSummary fields in the response", async () => {
      const response = buildMetricsSummary();
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await metricsService.getSummary();

      expect(result).toHaveProperty("total_publications");
      expect(result).toHaveProperty("active_publications");
      expect(result).toHaveProperty("total_reservations");
      expect(result).toHaveProperty("total_delivered");
      expect(result).toHaveProperty("total_cancelled");
      expect(result).toHaveProperty("conversion_rate");
    });

    it("should not pass any params to the endpoint", async () => {
      mockedApiClient.get.mockResolvedValueOnce(buildMetricsSummary());

      await metricsService.getSummary();

      expect(mockedApiClient.get).toHaveBeenCalledWith("/metrics/summary");
      expect(mockedApiClient.get).not.toHaveBeenCalledWith(
        "/metrics/summary",
        expect.anything()
      );
    });

    it("should reject when the API call fails with unauthorized", async () => {
      const error = new Error("Unauthorized");
      mockedApiClient.get.mockRejectedValueOnce(error);

      await expect(metricsService.getSummary()).rejects.toThrow("Unauthorized");
    });

    it("should reject when the server returns an error", async () => {
      const error = new Error("Internal Server Error");
      mockedApiClient.get.mockRejectedValueOnce(error);

      await expect(metricsService.getSummary()).rejects.toThrow(
        "Internal Server Error"
      );
    });
  });
});
