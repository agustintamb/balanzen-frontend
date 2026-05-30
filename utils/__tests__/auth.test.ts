import * as SecureStore from "expo-secure-store";

import { setAuthToken } from "@/api/client";
import type { AuthUser } from "@/stores/auth.store";
import { persistSession } from "@/utils/auth";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/api/client", () => ({
  setAuthToken: jest.fn(),
  default: {},
}));

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockSetAuthToken = setAuthToken as jest.MockedFunction<
  typeof setAuthToken
>;

const mockUser: AuthUser = {
  id: "user-uuid-123",
  email: "test@example.com",
  role: "CONSUMIDOR",
  first_name: "John",
  last_name: "Doe",
  has_address: true,
  photo_url: null,
};

const mockTokens = {
  access_token: "access-token-abc",
  refresh_token: "refresh-token-xyz",
};

describe("persistSession", () => {
  let mockSetAccessToken: jest.MockedFunction<(token: string | null) => void>;
  let mockSetUser: jest.MockedFunction<(user: AuthUser | null) => void>;

  beforeEach(() => {
    mockSetAccessToken = jest.fn();
    mockSetUser = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("SecureStore interactions", () => {
    it("should save access_token to SecureStore with correct key and value", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "access_token",
        mockTokens.access_token,
      );
    });

    it("should save refresh_token to SecureStore with correct key and value", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        "refresh_token",
        mockTokens.refresh_token,
      );
    });

    it("should call SecureStore.setItemAsync exactly twice", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2);
    });

    it("should save access_token before refresh_token", async () => {
      const callOrder: string[] = [];

      mockSecureStore.setItemAsync.mockImplementation(
        async (key: string, _value: string) => {
          callOrder.push(key);
        },
      );

      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(callOrder).toEqual(["access_token", "refresh_token"]);
    });
  });

  describe("apiClient token setup", () => {
    it("should call setAuthToken with the access token", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetAuthToken).toHaveBeenCalledWith(mockTokens.access_token);
    });

    it("should call setAuthToken exactly once", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetAuthToken).toHaveBeenCalledTimes(1);
    });

    it("should not call setAuthToken with the refresh token", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetAuthToken).not.toHaveBeenCalledWith(
        mockTokens.refresh_token,
      );
    });
  });

  describe("Zustand store updates", () => {
    it("should call setAccessToken with the access token", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetAccessToken).toHaveBeenCalledWith(mockTokens.access_token);
    });

    it("should call setAccessToken exactly once", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetAccessToken).toHaveBeenCalledTimes(1);
    });

    it("should call setUser with the full user object", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    });

    it("should call setUser exactly once", async () => {
      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetUser).toHaveBeenCalledTimes(1);
    });

    it("should call setUser with a COMERCIO role user", async () => {
      const comercioUser: AuthUser = {
        ...mockUser,
        role: "COMERCIO",
        has_address: false,
      };

      await persistSession(
        mockTokens,
        comercioUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetUser).toHaveBeenCalledWith(comercioUser);
    });

    it("should call setUser with a user that has no photo_url", async () => {
      const userWithoutPhoto: AuthUser = {
        ...mockUser,
        photo_url: undefined,
      };

      await persistSession(
        mockTokens,
        userWithoutPhoto,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(mockSetUser).toHaveBeenCalledWith(userWithoutPhoto);
    });
  });

  describe("operation order", () => {
    it("should call setAuthToken after both SecureStore saves complete", async () => {
      const operationOrder: string[] = [];

      mockSecureStore.setItemAsync.mockImplementation(async (key: string) => {
        operationOrder.push(`secureStore:${key}`);
      });

      mockSetAuthToken.mockImplementation(() => {
        operationOrder.push("setAuthToken");
      });

      await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(operationOrder.indexOf("secureStore:access_token")).toBeLessThan(
        operationOrder.indexOf("setAuthToken"),
      );
      expect(operationOrder.indexOf("secureStore:refresh_token")).toBeLessThan(
        operationOrder.indexOf("setAuthToken"),
      );
    });
  });

  describe("error handling", () => {
    it("should propagate error when SecureStore.setItemAsync rejects on access_token", async () => {
      const storeError = new Error("SecureStore write failed");
      mockSecureStore.setItemAsync.mockRejectedValueOnce(storeError);

      await expect(
        persistSession(mockTokens, mockUser, mockSetAccessToken, mockSetUser),
      ).rejects.toThrow("SecureStore write failed");
    });

    it("should propagate error when SecureStore.setItemAsync rejects on refresh_token", async () => {
      const storeError = new Error("SecureStore write failed on refresh");
      mockSecureStore.setItemAsync
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(storeError);

      await expect(
        persistSession(mockTokens, mockUser, mockSetAccessToken, mockSetUser),
      ).rejects.toThrow("SecureStore write failed on refresh");
    });

    it("should not call setAuthToken when SecureStore.setItemAsync rejects", async () => {
      mockSecureStore.setItemAsync.mockRejectedValueOnce(
        new Error("SecureStore write failed"),
      );

      await expect(
        persistSession(mockTokens, mockUser, mockSetAccessToken, mockSetUser),
      ).rejects.toThrow();

      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });

    it("should not call setAccessToken when SecureStore.setItemAsync rejects", async () => {
      mockSecureStore.setItemAsync.mockRejectedValueOnce(
        new Error("SecureStore write failed"),
      );

      await expect(
        persistSession(mockTokens, mockUser, mockSetAccessToken, mockSetUser),
      ).rejects.toThrow();

      expect(mockSetAccessToken).not.toHaveBeenCalled();
    });

    it("should not call setUser when SecureStore.setItemAsync rejects", async () => {
      mockSecureStore.setItemAsync.mockRejectedValueOnce(
        new Error("SecureStore write failed"),
      );

      await expect(
        persistSession(mockTokens, mockUser, mockSetAccessToken, mockSetUser),
      ).rejects.toThrow();

      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });

  describe("return value", () => {
    it("should return undefined (void) on success", async () => {
      const result = await persistSession(
        mockTokens,
        mockUser,
        mockSetAccessToken,
        mockSetUser,
      );

      expect(result).toBeUndefined();
    });
  });
});
