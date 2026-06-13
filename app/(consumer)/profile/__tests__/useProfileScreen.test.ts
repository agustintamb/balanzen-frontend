import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import { setAuthToken } from "@/api/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import * as navigation from "@/utils/navigation";
import useConsumerProfileDefaultExport, {
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

const MOCK_USER = {
  id: "u1",
  first_name: "Ana",
  last_name: "Pérez",
  email: "ana@example.com",
  phone: "1234567890",
  role: "CONSUMIDOR",
  photo_url: "https://res.cloudinary.com/x/image/upload/v1/photo.jpg",
  has_address: true,
  has_selected_address: true,
  selected_address: {
    id: "a1",
    formatted_address: "Av. Siempreviva 742, Springfield",
    street: "Av. Siempreviva",
    number: "742",
    city: "Springfield",
    province: "Springfield",
    lat: -34,
    lng: -58,
    is_selected: true,
  },
};

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockClear = jest.fn();
const mockQueryClear = jest.fn();

const setupMocks = (user = MOCK_USER, unreadCount = 3) => {
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

describe("useProfileScreen (consumer)", () => {
  describe("data derivation", () => {
    it("builds displayName from first_name and last_name", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.displayName).toBe("Ana Pérez");
    });

    it("returns empty displayName when user is undefined", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.displayName).toBe("");
    });

    it("computes initials from user name", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.initials).toBe("AP");
    });

    it("builds photoUrl using buildProfilePhotoUrl", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.photoUrl).toBe(`profile:${MOCK_USER.photo_url}`);
    });

    it("photoUrl is null when user has no photo_url", () => {
      setupMocks({ ...MOCK_USER, photo_url: null as any });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.photoUrl).toBeNull();
    });

    it("builds addressShort from selected_address", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.addressShort).toBe(
        "Av. Siempreviva 742, Springfield",
      );
    });

    it("addressShort is undefined when no selected_address", () => {
      setupMocks({ ...MOCK_USER, selected_address: null as any });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.addressShort).toBeUndefined();
    });

    it("exposes unreadCount from notifications", () => {
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.unreadCount).toBe(3);
    });

    it("unreadCount defaults to 0 when notifications are undefined", () => {
      (useNotifications as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useProfileScreen());
      expect(result.current.unreadCount).toBe(0);
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

    it("handleFavorites calls safePush('/favorites')", () => {
      const { result } = renderHook(() => useProfileScreen());
      act(() => result.current.handleFavorites());
      expect(navigation.safePush).toHaveBeenCalledWith("/favorites");
    });

    it("handleNotifications calls safePush('/notifications')", () => {
      const { result } = renderHook(() => useProfileScreen());
      act(() => result.current.handleNotifications());
      expect(navigation.safePush).toHaveBeenCalledWith("/notifications");
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

    it("clears auth token and store", async () => {
      const { result } = renderHook(() => useProfileScreen());
      await act(async () => {
        await result.current.handleLogout();
      });
      expect(setAuthToken).toHaveBeenCalledWith(null);
      expect(mockClear).toHaveBeenCalledTimes(1);
    });

    it("clears query cache and navigates to auth", async () => {
      const { result } = renderHook(() => useProfileScreen());
      await act(async () => {
        await result.current.handleLogout();
      });
      expect(mockQueryClear).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/(auth)");
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useConsumerProfileDefaultExport()).toBeNull();
    });
  });
});
