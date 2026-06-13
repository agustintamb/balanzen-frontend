import envConfig from "@/config/env";

// Mock must be declared before the module under test is imported.
// jest.mock() calls are hoisted above imports by babel-jest.
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        appEnv: "local",
        apiLocalPort: "3001",
        apiLocalDeviceUrl: null,
      },
    },
  },
}));

describe("envConfig (local defaults)", () => {
  it("exports a non-empty API_URL string", () => {
    expect(typeof envConfig.API_URL).toBe("string");
    expect(envConfig.API_URL.length).toBeGreaterThan(0);
  });

  it("exports ENV_NAME as 'local' for local environment", () => {
    expect(envConfig.ENV_NAME).toBe("local");
  });

  it("API_URL contains the configured port", () => {
    expect(envConfig.API_URL).toContain("3001");
  });

  it("API_URL is a valid URL-like string", () => {
    expect(envConfig.API_URL).toMatch(/^https?:\/\//);
  });
});
