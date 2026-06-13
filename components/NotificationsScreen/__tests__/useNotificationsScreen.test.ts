import { act, renderHook } from "@testing-library/react-native";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { useNotificationsScreen } from "../useNotificationsScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

jest.mock("@/hooks/useNotifications", () => ({
  useNotifications: jest.fn(),
  useMarkNotificationRead: jest.fn(),
  useMarkAllNotificationsRead: jest.fn(),
}));

const mockBack = jest.fn();
const mockMarkRead = jest.fn();
const mockMarkAllRead = jest.fn();
const mockRefetch = jest.fn();

const buildNotification = (id: string, read = false) => ({
  id,
  title: `Notification ${id}`,
  message: `Message ${id}`,
  type: "NEW_PUBLICATION" as const,
  read,
  created_at: new Date().toISOString(),
});

const setupMocks = (
  notifications = [buildNotification("n1"), buildNotification("n2", true)],
  unreadCount = 1,
  extras: { isLoading?: boolean; isError?: boolean } = {},
) => {
  const { useRouter } = require("expo-router");
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  (useNotifications as jest.Mock).mockReturnValue({
    data: { notifications, unread_count: unreadCount },
    isLoading: extras.isLoading ?? false,
    isError: extras.isError ?? false,
    isRefetching: false,
    refetch: mockRefetch,
  });
  (useMarkNotificationRead as jest.Mock).mockReturnValue({
    mutate: mockMarkRead,
  });
  (useMarkAllNotificationsRead as jest.Mock).mockReturnValue({
    mutate: mockMarkAllRead,
    isPending: false,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

describe("useNotificationsScreen", () => {
  describe("data derivation", () => {
    it("exposes notifications array", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.notifications).toHaveLength(2);
    });

    it("exposes unreadCount", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.unreadCount).toBe(1);
    });

    it("defaults notifications to [] when data is undefined", () => {
      (useNotifications as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        isRefetching: false,
        refetch: mockRefetch,
      });
      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.notifications).toEqual([]);
    });

    it("defaults unreadCount to 0 when data is undefined", () => {
      (useNotifications as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        isRefetching: false,
        refetch: mockRefetch,
      });
      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.unreadCount).toBe(0);
    });

    it("exposes isLoading and isError states", () => {
      setupMocks([], 0, { isLoading: true, isError: false });
      const { result } = renderHook(() => useNotificationsScreen());
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isError).toBe(false);
    });
  });

  describe("handleBack", () => {
    it("calls router.back()", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      act(() => {
        result.current.handleBack();
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("handlePressNotification", () => {
    it("calls markRead when notification is unread", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      act(() => {
        result.current.handlePressNotification("n1");
      });
      expect(mockMarkRead).toHaveBeenCalledWith("n1");
    });

    it("does not call markRead when notification is already read", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      act(() => {
        result.current.handlePressNotification("n2");
      });
      expect(mockMarkRead).not.toHaveBeenCalled();
    });

    it("does nothing when notification id is not found", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      act(() => {
        result.current.handlePressNotification("nonexistent");
      });
      expect(mockMarkRead).not.toHaveBeenCalled();
    });
  });

  describe("handleMarkAllRead", () => {
    it("calls markAllRead when unreadCount > 0", () => {
      const { result } = renderHook(() => useNotificationsScreen());
      act(() => {
        result.current.handleMarkAllRead();
      });
      expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
    });

    it("does not call markAllRead when unreadCount is 0", () => {
      setupMocks([], 0);
      const { result } = renderHook(() => useNotificationsScreen());
      act(() => {
        result.current.handleMarkAllRead();
      });
      expect(mockMarkAllRead).not.toHaveBeenCalled();
    });
  });
});
