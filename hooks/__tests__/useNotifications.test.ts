import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

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

const buildNotification = (overrides?: Partial<Notification>): Notification => ({
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
  overrides?: Partial<NotificationListResponse>
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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { Wrapper, queryClient };
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe("useNotifications", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("useNotifications", () => {
    it("should return notifications list on successful fetch", async () => {
      const { Wrapper } = createWrapper();
      const response = buildListResponse();
      mockedNotificationsService.list.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(response);
      expect(result.current.data?.notifications).toHaveLength(2);
    });

    it("should call notificationsService.list with undefined params when none are passed", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.list.mockResolvedValueOnce(buildListResponse());

      renderHook(() => useNotifications(), { wrapper: Wrapper });

      await waitFor(() =>
        expect(mockedNotificationsService.list).toHaveBeenCalledWith(undefined)
      );
    });

    it("should call notificationsService.list with pagination params when provided", async () => {
      const { Wrapper } = createWrapper();
      const params: NotificationFilters = { page: 2, limit: 5 };
      mockedNotificationsService.list.mockResolvedValueOnce(buildListResponse());

      renderHook(() => useNotifications(params), { wrapper: Wrapper });

      await waitFor(() =>
        expect(mockedNotificationsService.list).toHaveBeenCalledWith(params)
      );
    });

    it("should call notificationsService.list with read filter set to false", async () => {
      const { Wrapper } = createWrapper();
      const params: NotificationFilters = { read: false };
      const unreadResponse = buildListResponse({
        notifications: [buildNotification({ read: false })],
        unread_count: 1,
        pagination: { ...mockPagination, total: 1 },
      });
      mockedNotificationsService.list.mockResolvedValueOnce(unreadResponse);

      const { result } = renderHook(() => useNotifications(params), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.list).toHaveBeenCalledWith(params);
      expect(result.current.data?.notifications[0].read).toBe(false);
    });

    it("should use queryKey ['notifications', params]", async () => {
      const { Wrapper, queryClient } = createWrapper();
      const params: NotificationFilters = { read: true };
      mockedNotificationsService.list.mockResolvedValueOnce(buildListResponse());

      renderHook(() => useNotifications(params), { wrapper: Wrapper });

      await waitFor(() =>
        expect(
          queryClient.getQueryState(["notifications", params])
        ).toBeDefined()
      );
    });

    it("should set isError to true and expose the error when the service rejects", async () => {
      const { Wrapper } = createWrapper();
      const error = new Error("Network Error");
      mockedNotificationsService.list.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Network Error");
    });

    it("should return empty notifications list and zero unread_count when there are no notifications", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse({
          notifications: [],
          unread_count: 0,
          pagination: { ...mockPagination, total: 0, total_pages: 0 },
        })
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.notifications).toHaveLength(0);
      expect(result.current.data?.unread_count).toBe(0);
    });

    it("should start in loading state before data resolves", () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.list.mockImplementation(
        () => new Promise(() => undefined)
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: Wrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should return the correct unread_count from the response", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse({ unread_count: 7 })
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.unread_count).toBe(7);
    });

    it("should return pagination metadata with the response", async () => {
      const { Wrapper } = createWrapper();
      const pagination: Pagination = { page: 3, limit: 5, total: 50, total_pages: 10 };
      mockedNotificationsService.list.mockResolvedValueOnce(
        buildListResponse({ pagination })
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pagination).toEqual(pagination);
    });
  });

  describe("useMarkNotificationRead", () => {
    it("should call notificationsService.markRead with the notification id on mutate", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markRead).toHaveBeenCalledWith(
        "notif-uuid-001", expect.anything()
      );
    });

    it("should call notificationsService.markRead exactly once per mutate call", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markRead).toHaveBeenCalledTimes(1);
    });

    it("should invalidate ['notifications'] queries on successful markRead", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notifications"] });
    });

    it("should set isError to true when the service rejects", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockRejectedValueOnce(
        new Error("Not Found")
      );

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate("invalid-id");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Not Found");
    });

    it("should not invalidate queries when the mutation fails", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markRead.mockRejectedValueOnce(
        new Error("Unauthorized")
      );
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate("notif-uuid-001");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("should be in idle state before mutate is called", () => {
      const { Wrapper } = createWrapper();

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: Wrapper,
      });

      expect(result.current.isIdle).toBe(true);
    });

    it("should pass the correct id for a different notification", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.markRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkNotificationRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate("notif-uuid-099");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markRead).toHaveBeenCalledWith(
        "notif-uuid-099", expect.anything()
      );
    });
  });

  describe("useMarkAllNotificationsRead", () => {
    it("should call notificationsService.markAllRead on mutate", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.markAllRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markAllRead).toHaveBeenCalledTimes(1);
    });

    it("should call notificationsService.markAllRead with no arguments", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.markAllRead.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedNotificationsService.markAllRead).toHaveBeenCalled();
    });

    it("should invalidate ['notifications'] queries on successful markAllRead", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markAllRead.mockResolvedValueOnce(undefined);
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notifications"] });
    });

    it("should set isError to true when the service rejects", async () => {
      const { Wrapper } = createWrapper();
      mockedNotificationsService.markAllRead.mockRejectedValueOnce(
        new Error("Unauthorized")
      );

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Unauthorized");
    });

    it("should not invalidate queries when markAllRead fails", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedNotificationsService.markAllRead.mockRejectedValueOnce(
        new Error("Server Error")
      );
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: Wrapper,
      });
      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("should be in idle state before mutate is called", () => {
      const { Wrapper } = createWrapper();

      const { result } = renderHook(() => useMarkAllNotificationsRead(), {
        wrapper: Wrapper,
      });

      expect(result.current.isIdle).toBe(true);
    });
  });
});
