import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import apiClient, { setAuthToken } from "@/api/client";

jest.mock("@/config/env", () => ({
  __esModule: true,
  default: {
    API_URL: "https://balanzen-backend-testing.up.railway.app/api/v1",
    ENV_NAME: "testing",
  },
}));

jest.mock("axios", () => {
  const requestUseFn = jest.fn();
  const responseUseFn = jest.fn();
  const createFn = jest.fn(() => ({
    interceptors: {
      request: { use: requestUseFn },
      response: { use: responseUseFn },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  }));

  return {
    __esModule: true,
    default: {
      create: createFn,
    },
  };
});

describe("apiClient", () => {
  const mockedAxiosCreate = axios.create as jest.MockedFunction<
    typeof axios.create
  >;

  type MockedInstance = ReturnType<typeof mockedAxiosCreate> & {
    interceptors: {
      request: { use: jest.Mock };
      response: { use: jest.Mock };
    };
  };

  let requestSuccessHandler: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig;
  let requestErrorHandler: (error: unknown) => Promise<never>;
  let responseSuccessHandler: (response: AxiosResponse) => unknown;
  let responseErrorHandler: (error: unknown) => Promise<never>;

  beforeAll(() => {
    const instance = apiClient as unknown as MockedInstance;
    const requestUseCalls = instance.interceptors.request.use.mock.calls;
    const responseUseCalls = instance.interceptors.response.use.mock.calls;

    requestSuccessHandler =
      requestUseCalls[0]?.[0] as typeof requestSuccessHandler;
    requestErrorHandler = requestUseCalls[0]?.[1] as typeof requestErrorHandler;
    responseSuccessHandler =
      responseUseCalls[0]?.[0] as typeof responseSuccessHandler;
    responseErrorHandler =
      responseUseCalls[0]?.[1] as typeof responseErrorHandler;
  });

  afterEach(() => {
    setAuthToken(null);
  });

  describe("instance creation", () => {
    it("should create axios instance with correct base URL", () => {
      expect(mockedAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "https://balanzen-backend-testing.up.railway.app/api/v1",
        }),
      );
    });

    it("should create axios instance with Content-Type application/json header", () => {
      expect(mockedAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should create axios instance with 10000ms timeout", () => {
      expect(mockedAxiosCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 10000,
        }),
      );
    });

    it("should register both request and response interceptors", () => {
      const instance = apiClient as unknown as MockedInstance;
      expect(instance.interceptors.request.use).toHaveBeenCalledTimes(1);
      expect(instance.interceptors.response.use).toHaveBeenCalledTimes(1);
    });

    it("should export apiClient as the default export", () => {
      expect(apiClient).toBeDefined();
    });
  });

  describe("setAuthToken", () => {
    it("should be exported as a named export function", () => {
      expect(setAuthToken).toBeDefined();
      expect(typeof setAuthToken).toBe("function");
    });

    it("should allow setting a token so subsequent requests include the Authorization header", () => {
      setAuthToken("new-token-xyz");

      const config = {
        headers: {} as Record<string, string>,
      } as InternalAxiosRequestConfig;

      const result = requestSuccessHandler(config);

      expect((result.headers as Record<string, string>).Authorization).toBe(
        "Bearer new-token-xyz",
      );
    });

    it("should clear the token when set to null so subsequent requests have no Authorization header", () => {
      setAuthToken("some-token");
      setAuthToken(null);

      const config = {
        headers: {} as Record<string, string>,
      } as InternalAxiosRequestConfig;

      const result = requestSuccessHandler(config);

      expect(
        (result.headers as Record<string, string>).Authorization,
      ).toBeUndefined();
    });
  });

  describe("request interceptor", () => {
    it("should add Bearer token to Authorization header when token is set", () => {
      setAuthToken("my-secret-token");

      const config = {
        headers: {} as Record<string, string>,
      } as InternalAxiosRequestConfig;

      const result = requestSuccessHandler(config);

      expect((result.headers as Record<string, string>).Authorization).toBe(
        "Bearer my-secret-token",
      );
    });

    it("should not add Authorization header when token is null", () => {
      const config = {
        headers: {} as Record<string, string>,
      } as InternalAxiosRequestConfig;

      const result = requestSuccessHandler(config);

      expect(
        (result.headers as Record<string, string>).Authorization,
      ).toBeUndefined();
    });

    it("should return the config object unchanged when token is not set", () => {
      const config = {
        headers: { "Content-Type": "application/json" } as Record<
          string,
          string
        >,
        url: "/publications",
        method: "get",
      } as InternalAxiosRequestConfig;

      const result = requestSuccessHandler(config);

      expect(result.url).toBe("/publications");
      expect(result.method).toBe("get");
      expect((result.headers as Record<string, string>)["Content-Type"]).toBe(
        "application/json",
      );
    });

    it("should reject with the original error when request setup fails", async () => {
      const error = new Error("Network setup error");
      await expect(requestErrorHandler(error)).rejects.toThrow(
        "Network setup error",
      );
    });
  });

  describe("response interceptor", () => {
    it("should return response.data on successful response", () => {
      const responseData = { id: "123", name: "Test Publication" };
      const response = {
        data: responseData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as AxiosRequestConfig,
      } as AxiosResponse;

      const result = responseSuccessHandler(response);

      expect(result).toEqual(responseData);
    });

    it("should unwrap paginated data from response", () => {
      const responseData = {
        items: [{ id: "1" }, { id: "2" }],
        pagination: { total: 2, page: 1, limit: 10 },
      };
      const response = { data: responseData, status: 200 } as AxiosResponse;

      const result = responseSuccessHandler(response);

      expect(result).toEqual(responseData);
    });

    it("should reject with error.response.data.message on API error", async () => {
      const apiError = {
        response: {
          data: { message: "Unauthorized access" },
          status: 401,
        },
        message: "Request failed with status code 401",
      };

      await expect(responseErrorHandler(apiError)).rejects.toThrow(
        "Unauthorized access",
      );
    });

    it("should reject with error.message as fallback when response has no data.message", async () => {
      const networkError = {
        response: { data: {}, status: 500 },
        message: "Internal Server Error",
      };

      await expect(responseErrorHandler(networkError)).rejects.toThrow(
        "Internal Server Error",
      );
    });

    it("should reject with error.message when response is undefined (network error)", async () => {
      const networkError = {
        response: undefined,
        message: "Network Error",
      };

      await expect(responseErrorHandler(networkError)).rejects.toThrow(
        "Network Error",
      );
    });

    it("should reject with 'Error desconocido' when both response message and error message are missing", async () => {
      const unknownError = {
        response: undefined,
        message: undefined,
      };

      await expect(responseErrorHandler(unknownError)).rejects.toThrow(
        "Error desconocido",
      );
    });

    it("should reject with an instance of Error", async () => {
      const apiError = {
        response: { data: { message: "Not found" }, status: 404 },
        message: "Request failed",
      };

      await expect(responseErrorHandler(apiError)).rejects.toBeInstanceOf(
        Error,
      );
    });

    it("should prefer response.data.message over error.message", async () => {
      const apiError = {
        response: { data: { message: "Specific API error" }, status: 422 },
        message: "Generic axios error",
      };

      await expect(responseErrorHandler(apiError)).rejects.toThrow(
        "Specific API error",
      );
    });
  });
});
