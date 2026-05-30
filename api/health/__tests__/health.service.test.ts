import apiClient from "@/api/client";
import { healthService } from "@/api/health/health.service";
import { HealthResponse } from "@/api/health/health.types";

jest.mock("@/api/client", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const buildHealthResponse = (
  overrides?: Partial<HealthResponse>
): HealthResponse => ({
  success: true,
  message: "API is running",
  environment: "production",
  timestamp: "2026-05-30T10:00:00.000Z",
  database: {
    status: "connected",
    name: "balanzen_db",
  },
  uptime: "3d 4h 22m",
  ...overrides,
});

describe("healthService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("check", () => {
    it("should call GET /health", async () => {
      const response = buildHealthResponse();
      mockedApiClient.get.mockResolvedValueOnce(response);

      await healthService.check();

      expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockedApiClient.get).toHaveBeenCalledWith("/health");
    });

    it("should return the HealthResponse from the API", async () => {
      const response = buildHealthResponse();
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result).toEqual(response);
    });

    it("should return success true when the API is healthy", async () => {
      const response = buildHealthResponse({ success: true });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result.success).toBe(true);
    });

    it("should return the correct environment in the response", async () => {
      const response = buildHealthResponse({ environment: "staging" });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result.environment).toBe("staging");
    });

    it("should return database connection status in the response", async () => {
      const response = buildHealthResponse({
        database: { status: "connected", name: "balanzen_staging" },
      });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result.database.status).toBe("connected");
      expect(result.database.name).toBe("balanzen_staging");
    });

    it("should return a valid ISO timestamp", async () => {
      const timestamp = "2026-05-30T10:00:00.000Z";
      const response = buildHealthResponse({ timestamp });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result.timestamp).toBe(timestamp);
      expect(new Date(result.timestamp).toISOString()).toBe(timestamp);
    });

    it("should return the uptime string in the response", async () => {
      const response = buildHealthResponse({ uptime: "7d 12h 5m" });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result.uptime).toBe("7d 12h 5m");
    });

    it("should contain all required HealthResponse fields", async () => {
      const response = buildHealthResponse();
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("environment");
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("database");
      expect(result).toHaveProperty("database.status");
      expect(result).toHaveProperty("database.name");
      expect(result).toHaveProperty("uptime");
    });

    it("should not pass any params to the endpoint", async () => {
      mockedApiClient.get.mockResolvedValueOnce(buildHealthResponse());

      await healthService.check();

      expect(mockedApiClient.get).toHaveBeenCalledWith("/health");
      expect(mockedApiClient.get).not.toHaveBeenCalledWith(
        "/health",
        expect.anything()
      );
    });

    it("should reject when the API is unreachable", async () => {
      const error = new Error("Network error");
      mockedApiClient.get.mockRejectedValueOnce(error);

      await expect(healthService.check()).rejects.toThrow("Network error");
    });

    it("should handle a degraded health response where success is false", async () => {
      const response = buildHealthResponse({
        success: false,
        message: "Database connection failed",
        database: { status: "disconnected", name: "balanzen_db" },
      });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await healthService.check();

      expect(result.success).toBe(false);
      expect(result.message).toBe("Database connection failed");
      expect(result.database.status).toBe("disconnected");
    });
  });
});
