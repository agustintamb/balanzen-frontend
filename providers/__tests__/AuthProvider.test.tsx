import React from "react";
import { Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { render, waitFor } from "@testing-library/react-native";
import { setAuthToken } from "@/api/client";
import { usersService } from "@/api/users/users.service";
import type { User } from "@/api/users/users.types";
import { useAuthStore } from "@/stores/auth.store";
import AuthProvider from "../AuthProvider";

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@/api/client", () => ({
  setAuthToken: jest.fn(),
}));

jest.mock("@/api/users/users.service", () => ({
  usersService: {
    getMe: jest.fn(),
  },
}));

const mockSetUser = jest.fn();
const mockSetAccessToken = jest.fn();
const mockSetInitialized = jest.fn();

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildUser = (overrides: Partial<User> = {}): User => ({
  id: "user-123",
  email: "test@example.com",
  role: "CONSUMIDOR",
  first_name: "Ana",
  last_name: "García",
  phone: "1234567890",
  dni: "12345678",
  photo_url: null,
  has_address: true,
  selected_address: null,
  created_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockGetMe = usersService.getMe as jest.MockedFunction<
  typeof usersService.getMe
>;
const mockSetAuthToken = setAuthToken as jest.MockedFunction<
  typeof setAuthToken
>;

const setupAuthStoreMock = () => {
  (useAuthStore as unknown as jest.Mock).mockReturnValue({
    setUser: mockSetUser,
    setAccessToken: mockSetAccessToken,
    setInitialized: mockSetInitialized,
  });
};

const ChildComponent = () => <Text testID="child">child content</Text>;

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("AuthProvider", () => {
  beforeEach(() => {
    setupAuthStoreMock();
    mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("when no token is stored", () => {
    it("should call setInitialized without calling setUser", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockSetAccessToken).not.toHaveBeenCalled();
      expect(mockGetMe).not.toHaveBeenCalled();
    });

    it("should not set auth token on the client when no token is stored", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(mockSetAuthToken).not.toHaveBeenCalled();
    });
  });

  describe("when a valid token is stored", () => {
    const TOKEN = "valid-jwt-token";

    beforeEach(() => {
      mockSecureStore.getItemAsync.mockResolvedValue(TOKEN);
    });

    it("should set the auth token on the client and store", async () => {
      const user = buildUser();
      mockGetMe.mockResolvedValue(user);

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(mockSetAuthToken).toHaveBeenCalledWith(TOKEN);
      expect(mockSetAccessToken).toHaveBeenCalledWith(TOKEN);
    });

    it("should call usersService.getMe to fetch current user", async () => {
      const user = buildUser();
      mockGetMe.mockResolvedValue(user);

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockGetMe).toHaveBeenCalledTimes(1);
      });
    });

    it("should call setUser with the correct shape when getMe succeeds", async () => {
      const user = buildUser({
        id: "abc-456",
        email: "usuario@test.com",
        role: "COMERCIO",
        first_name: "Carlos",
        last_name: "López",
        photo_url: "https://cdn.example.com/photo.jpg",
        has_address: false,
      });
      mockGetMe.mockResolvedValue(user);

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({
          id: "abc-456",
          email: "usuario@test.com",
          role: "COMERCIO",
          first_name: "Carlos",
          last_name: "López",
          has_address: false,
          has_selected_address: false,
          photo_url: "https://cdn.example.com/photo.jpg",
        });
      });
    });

    it("should call setInitialized after a successful getMe", async () => {
      mockGetMe.mockResolvedValue(buildUser());

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(mockSetUser).toHaveBeenCalledTimes(1);
    });

    it("should not include extra user fields (phone, dni, etc.) in setUser payload", async () => {
      const user = buildUser({ phone: "5551234567", dni: "99887766" });
      mockGetMe.mockResolvedValue(user);

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledTimes(1);
      });

      const calledWith = mockSetUser.mock.calls[0][0];
      expect(calledWith).not.toHaveProperty("phone");
      expect(calledWith).not.toHaveProperty("dni");
      expect(calledWith).not.toHaveProperty("selected_address");
      expect(calledWith).not.toHaveProperty("created_at");
    });
  });

  describe("when getMe fails (token invalid or expired)", () => {
    const TOKEN = "expired-jwt-token";

    beforeEach(() => {
      mockSecureStore.getItemAsync.mockResolvedValue(TOKEN);
    });

    it("should delete access_token and refresh_token from SecureStore", async () => {
      mockGetMe.mockRejectedValue(new Error("Unauthorized"));

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
          "access_token",
        );
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
          "refresh_token",
        );
      });
    });

    it("should clear the auth token on the client when getMe fails", async () => {
      mockGetMe.mockRejectedValue(new Error("Token expired"));

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(mockSetAuthToken).toHaveBeenLastCalledWith(null);
    });

    it("should not call setUser when getMe fails", async () => {
      mockGetMe.mockRejectedValue(new Error("Network error"));

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(mockSetUser).not.toHaveBeenCalled();
    });

    it("should still call setInitialized even when getMe fails", async () => {
      mockGetMe.mockRejectedValue(new Error("Server error"));

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("rendering children", () => {
    it("should render children regardless of auth state", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const { getByTestId } = render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(getByTestId("child")).toBeTruthy();
    });

    it("should render children when token is present and getMe succeeds", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("valid-token");
      mockGetMe.mockResolvedValue(buildUser());

      const { getByTestId } = render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(getByTestId("child")).toBeTruthy();
    });

    it("should render children when token is present and getMe fails", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("bad-token");
      mockGetMe.mockRejectedValue(new Error("401 Unauthorized"));

      const { getByTestId } = render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSetInitialized).toHaveBeenCalledTimes(1);
      });

      expect(getByTestId("child")).toBeTruthy();
    });
  });

  describe("SecureStore key", () => {
    it("should read from the 'access_token' key in SecureStore", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      render(
        <AuthProvider>
          <ChildComponent />
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
          "access_token",
        );
      });
    });
  });
});
