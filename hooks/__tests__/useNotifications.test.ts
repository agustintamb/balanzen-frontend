import { renderHook, waitFor } from "@testing-library/react-native";
import createWrapper from "@/__test-utils__/createWrapper";
import { notificationsService } from "@/api/notifications/notifications.service";
import type {
  Notification,
  NotificationFilters,
  NotificationListResponse,
} from "@/api/notifications/notifications.types";
import type { Pagination } from "@/api/shared.types";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";

jest.mock("@/api/notifications/notifications.service", () => ({
  notificationsService: {
    list: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  },
}));

const mockedNotificationsService = notificationsService as jest.Mocked<
  typeof notificationsService
>;

// ── fixtures ──────────────────────────────────────────────────────────────────

const mockPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 2,
  total_pages: 1,
};

const buildNotification = (
  overrides?: Partial<Notification>,
): Notification => ({
  id: "notif-uuid-001",
  type: "NEW_RESERVATION",
  title: "Nueva reserva",
  message: "Un consumidor reservó tu publicación",
  reference_id: "order-uuid-001",
  reference_type: "ORDER",
  read: false,
  created_at: "2026-05-30T10:00:00.000Z",
  ...overrides,
});

const buildListResponse = (
  overrides?: Partial<NotificationListResponse>,
): NotificationListResponse => ({
  unread_count: 2,
  notifications: [
    buildNotification(),
    buildNotification({ id: "notif-uuid-002", read: true }),
  ],
  pagination: mockPagination,
  ...overrides,
});

// ── helpers ───────────────────────────────────────────────────────────────────

// ── tests ─────────────────────────────────────────────────────────────────────

describe("useNotifications", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("useNotifications", () => {
    it("should return notifications list on successful fetch", async () => {
      const { wrapper } = createWrapper();
      const response = buildListResponse();
      mockedNotificationsService.list.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useNotifications(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(response);
      expect(result.current.data?.notifications).toHaveLength(2);
    });

    it("should call notificationsService.list with undefined params when none are passed", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse(),
      );

      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() =>
        expect(mockedNotificationsService.list).toHaveBeenCalledWith(undefined),
      );
    });

    it("should call notificationsService.list with pagination params when provided", async () => {
      const { wrapper } = createWrapper();
      const params: NotificationFilters = { page: 2, limit: 5 };
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse(),
      );

      renderHook(() => useNotifications(params), { wrapper });

      await waitFor(() =>
        expect(mockedNotificationsService.list).toHaveBeenCalledWith(params),
      );
    });

    it("should call notificationsService.list with read filter set to false", async () => {
      const { wrapper } = createWrapper();
      const params: NotificationFilters = { read: false };
      const unreadResponse = buildListResponse({
        notifications: [buildNotification({ read: false })],
        unread_count: 1,
        pagination: { ...mockPagination, total: 1 },
      });
      mockedNotificationsService.list.mockResolvedValueOnce(unreadResponse);

      const { result } = renderHook(() => useNotifications(params), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.list).toHaveBeenCalledWith(params);
      expect(result.current.data?.notifications[0].read).toBe(false);
    });

    it("should use queryKey ['notifications', params]", async () => {
      const { wrapper, queryClient } = createWrapper();
      const params: NotificationFilters = { read: true };
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse(),
      );

      renderHook(() => useNotifications(params), { wrapper });

      await waitFor(() =>
        expect(
          queryClient.getQueryState(["notifications", params]),
        ).toBeDefined(),
      );
    });

    it("should set isError to true and expose the error when the service rejects", async () => {
      const { wrapper } = createWrapper();
      const error = new Error("Network Error");
      mockedNotificationsService.list.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useNotifications(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Network Error");
    });

    it("should return empty notifications list and zero unread_count when there are no notifications", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse({
          notifications: [],
          unread_count: 0,
          pagination: { ...mockPagination, total: 0, total_pages: 0 },
        }),
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.notifications).toHaveLength(0);
      expect(result.current.data?.unread_count).toBe(0);
    });

    it("should start in loading state before data resolves", () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.list.mockImplementation(
        () => new Promise(() => undefined),
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should return the correct unread_count from the response", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse({ unread_count: 7 }),
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.unread_count).toBe(7);
    });

    it("should return pagination metadata with the response", async () => {
      const { wrapper } = createWrapper();
      const pagination: Pagination = {
        page: 3,
        limit: 5,
        total: 50,
        total_pages: 10,
      };
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse({ pagination }),
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pagination).toEqual(pagination);
    });
  });

  describe("useMarkNotificationRead", () => {
    it("should call notificationsService.markRead with the notification id on mutate", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markRead).toHaveBeenCalledWith(
        "notif-uuid-001",
        expect.anything(),
      );
    });

    it("should call notificationsService.markRead exactly once per mutate call", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markRead).toHaveBeenCalledTimes(1);
    });

    it("should invalidate ['notifications'] queries on successful markRead", async () => {
      const { wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["notifications"],
      });
    });

    it("should set isError to true when the service rejects", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockRejectedValueOnce(
        new Error("Not Found"),
      );

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper,
      });
      result.current.mutate("invalid-id");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Not Found");
    });

    it("should not invalidate queries when the mutation fails", async () => {
      const { wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markRead.mockRejectedValueOnce(
        new Error("Unauthorized"),
      );
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("should be in idle state before mutate is called", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper,
      });

      expect(result.current.isIdle).toBe(true);
    });

    it("should pass the correct id for a different notification", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper,
      });
      result.current.mutate("notif-uuid-099");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markRead).toHaveBeenCalledWith(
        "notif-uuid-099",
        expect.anything(),
      );
    });
  });

  describe("useMarkAllNotificationsRead", () => {
    it("should call notificationsService.markAllRead on mutate", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.markAllRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markAllRead).toHaveBeenCalledTimes(1);
    });

    it("should call notificationsService.markAllRead with no arguments", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.markAllRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markAllRead).toHaveBeenCalled();
    });

    it("should invalidate ['notifications'] queries on successful markAllRead", async () => {
      const { wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markAllRead.mockResolvedValueOnce(undefined);
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["notifications"],
      });
    });

    it("should set isError to true when the service rejects", async () => {
      const { wrapper } = createWrapper();
      mockedNotificationsService.markAllRead.mockRejectedValueOnce(
        new Error("Unauthorized"),
      );

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Unauthorized");
    });

    it("should not invalidate queries when markAllRead fails", async () => {
      const { wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markAllRead.mockRejectedValueOnce(
        new Error("Server Error"),
      );
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("should be in idle state before mutate is called", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper,
      });

      expect(result.current.isIdle).toBe(true);
    });
  });
});
