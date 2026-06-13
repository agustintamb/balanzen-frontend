import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import { setAuthToken } from "@/api/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import * as navigation from "@/utils/navigation";
import useCommerceProfileDefaultExport, {
  useProfileScreen,
} from "../useProfileScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

jest.mock("expo-secure-store", () => ({
  deleteItemAsync: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("@/api/client", () => ({
  setAuthToken: jest.fn(),
}));

jest.mock("@/hooks/useUsers", () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock("@/hooks/useNotifications", () => ({
  useNotifications: jest.fn(),
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("@/utils/cloudinary", () => ({
  buildProfilePhotoUrl: jest.fn((url: string) => `profile:${url}`),
  buildDetailImageUrl: jest.fn((url: string) => `detail:${url}`),
}));

jest.mock("@/utils/navigation", () => ({
  safePush: jest.fn(),
}));

const MOCK_USER_COMMERCE = {
  id: "u2",
  first_name: "Carlos",
  last_name: "Díaz",
  email: "carlos@comercio.com",
  phone: "9876543210",
  role: "COMERCIO",
  photo_url: null,
  business_name: "El Comercio SA",
  has_address: true,
  has_selected_address: true,
  selected_address: {
    id: "a1",
    formatted_address: "Corrientes 1234, CABA",
    street: "Corrientes",
    number: "1234",
    city: "CABA",
    province: "Buenos Aires",
    lat: -34.6,
    lng: -58.4,
    is_selected: true,
  },
};

const MOCK_USER_NO_BUSINESS_NAME = {
  ...MOCK_USER_COMMERCE,
  business_name: null,
};

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockClear = jest.fn();
const mockQueryClear = jest.fn();

const setupMocks = (user: any = MOCK_USER_COMMERCE, unreadCount = 2) => {
  const { useRouter } = require("expo-router");
  (useRouter as jest.Mock).mockReturnValue({
    back: mockBack,
    replace: mockReplace,
  });
  (useCurrentUser as jest.Mock).mockReturnValue({ data: user });
  (useNotifications as jest.Mock).mockReturnValue({
    data: { notifications: [], unread_count: unreadCount },
  });
  (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
    typeof selector === "function" ? selector({ clear: mockClear }) : mockClear,
  );
  (useQueryClient as jest.Mock).mockReturnValue({ clear: mockQueryClear });
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

describe("useProfileScreen (commerce)", () => {
  describe("data derivation", () => {
    it("uses business_name as displayName when present", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.displayName).toBe("El Comercio SA");
    });

    it("falls back to first_name + last_name when business_name is null", () => {
      setupMocks(MOCK_USER_NO_BUSINESS_NAME);
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.displayName).toBe("Carlos Díaz");
    });

    it("returns empty displayName when user is undefined", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.displayName).toBe("");
    });

    it("computes initials from first_name and last_name", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.initials).toBe("CD");
    });

    it("photoUrl is null when user has no photo_url", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.photoUrl).toBeNull();
    });

    it("builds addressShort from selected_address", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.addressShort).toBe("Corrientes 1234, CABA");
    });

    it("exposes unreadCount from notifications", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.unreadCount).toBe(2);
    });

    it("unreadCount defaults to 0 when notifications data is undefined", () => {
      (useNotifications as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.unreadCount).toBe(0);
    });

    it("builds photoUrl when user has photo_url", () => {
      setupMocks({
        ...MOCK_USER_COMMERCE,
        photo_url: "https://res.cloudinary.com/x/image/upload/v1/photo.jpg",
      });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.photoUrl).toBe(
        "profile:https://res.cloudinary.com/x/image/upload/v1/photo.jpg",
      );
    });

    it("builds photoFullUrl when user has photo_url", () => {
      setupMocks({
        ...MOCK_USER_COMMERCE,
        photo_url: "https://res.cloudinary.com/x/image/upload/v1/photo.jpg",
      });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.photoFullUrl).toBe(
        "detail:https://res.cloudinary.com/x/image/upload/v1/photo.jpg",
      );
    });
  });

  describe("navigation handlers", () => {
    it("handleEditProfile calls safePush('/edit-profile')", () => {
      const { result } = renderHook(() => useProfileScreen());
      act(() => result.current.handleEditProfile());
      expect(navigation.safePush).toHaveBeenCalledWith("/edit-profile");
    });

    it("handleAddresses calls safePush('/(onboarding)/address')", () => {
      const { result } = renderHook(() => useProfileScreen());
      act(() => result.current.handleAddresses());
      expect(navigation.safePush).toHaveBeenCalledWith("/(onboarding)/address");
    });

    it("handleChangePassword calls safePush('/change-password')", () => {
      const { result } = renderHook(() => useProfileScreen());
      act(() => result.current.handleChangePassword());
      expect(navigation.safePush).toHaveBeenCalledWith("/change-password");
    });

    it("handleNotifications calls safePush('/notifications')", () => {
      const { result } = renderHook(() => useProfileScreen());
      act(() => result.current.handleNotifications());
      expect(navigation.safePush).toHaveBeenCalledWith("/notifications");
    });

    it("handleMetrics calls safePush('/metrics')", () => {
      const { result } = renderHook(() => useProfileScreen());
      act(() => result.current.handleMetrics());
      expect(navigation.safePush).toHaveBeenCalledWith("/metrics");
    });
  });

  describe("handleLogout", () => {
    it("deletes secure store tokens", async () => {
      const { result } = renderHook(() => useProfileScreen());
      await act(async () => {
        await result.current.handleLogout();
      });
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("access_token");
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("refresh_token");
    });

    it("clears auth token, store, query cache and navigates to auth", async () => {
      const { result } = renderHook(() => useProfileScreen());
      await act(async () => {
        await result.current.handleLogout();
      });
      expect(setAuthToken).toHaveBeenCalledWith(null);
      expect(mockClear).toHaveBeenCalledTimes(1);
      expect(mockQueryClear).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/(auth)");
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useCommerceProfileDefaultExport()).toBeNull();
    });
  });
});
