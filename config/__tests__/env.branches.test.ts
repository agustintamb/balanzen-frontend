// Isolated branch tests for config/env.ts.
// Uses mutable shared state + jest.mock getter so each test can control
// Constants values without jest.doMock (which cannot override jest-expo's manual mock).

const mockExtra: {
  appEnv: string;
  apiLocalPort: string;
  apiLocalDeviceUrl: string | null;
} = { appEnv: "local", apiLocalPort: "3001", apiLocalDeviceUrl: null };

let mockPlatformOS = "android";

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      get extra() {
        return mockExtra;
      },
    },
  },
}));

jest.mock("react-native", () => ({
  Platform: {
    get OS() {
      return mockPlatformOS;
    },
  },
}));

describe("env.ts branch coverage", () => {
  beforeEach(() => {
    jest.resetModules();
    mockExtra.appEnv = "local";
    mockExtra.apiLocalPort = "3001";
    mockExtra.apiLocalDeviceUrl = null;
    mockPlatformOS = "android";
  });

  it("uses apiLocalDeviceUrl when provided (covers line 8)", () => {
    mockExtra.apiLocalDeviceUrl = "https://192.168.1.5:3001/api/v1";
    const result = require("../env").default;
    expect(result.API_URL).toBe("https://192.168.1.5:3001/api/v1");
  });

  it("uses localhost URL when Platform.OS is not android (covers line 10)", () => {
    mockPlatformOS = "ios";
    const result = require("../env").default;
    expect(result.API_URL).toBe("http://localhost:3001/api/v1");
  });

  it("falls back to local config for unknown appEnv (covers line 31)", () => {
    mockExtra.appEnv = "unknown_env";
    const result = require("../env").default;
    expect(result.ENV_NAME).toBe("local");
  });

  it("returns testing config when appEnv is 'testing'", () => {
    mockExtra.appEnv = "testing";
    const result = require("../env").default;
    expect(result.ENV_NAME).toBe("testing");
    expect(result.API_URL).toContain("testing");
  });

  it("returns production config when appEnv is 'production'", () => {
    mockExtra.appEnv = "production";
    const result = require("../env").default;
    expect(result.ENV_NAME).toBe("production");
    expect(result.API_URL).toContain("production");
  });
});
