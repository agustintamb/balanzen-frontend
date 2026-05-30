import apiClient from "@/api/client";
import { notificationsService } from "@/api/notifications/notifications.service";
import {
  Notification,
  NotificationFilters,
  NotificationListResponse,
} from "@/api/notifications/notifications.types";

jest.mock("@/api/client", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const buildNotification = (overrides?: Partial<Notification>): Notification => ({
  id: "notif-uuid-1",
  type: "NEW_RESERVATION",
  title: "Nueva reserva",
  message: "Un consumidor reservó tu publicación",
  reference_id: "ref-uuid-1",
  reference_type: "ORDER",
  read: false,
  created_at: "2026-05-30T10:00:00.000Z",
  ...overrides,
});

const buildListResponse = (
  overrides?: Partial<NotificationListResponse>
): NotificationListResponse => ({
  unread_count: 2,
  notifications: [buildNotification(), buildNotification({ id: "notif-uuid-2", read: true })],
  pagination: { page: 1, limit: 10, total: 2, total_pages: 1 },
  ...overrides,
});

describe("notificationsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should call GET /notifications without params when none are provided", async () => {
      const response = buildListResponse();
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await notificationsService.list();

      expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
      expect(mockedApiClient.get).toHaveBeenCalledWith("/notifications", {
        params: undefined,
      });
      expect(result).toEqual(response);
    });

    it("should call GET /notifications with pagination params when provided", async () => {
      const response = buildListResponse();
      const params: NotificationFilters = { page: 2, limit: 5 };
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await notificationsService.list(params);

      expect(mockedApiClient.get).toHaveBeenCalledWith("/notifications", {
        params,
      });
      expect(result).toEqual(response);
    });

    it("should call GET /notifications with read filter set to false", async () => {
      const unreadNotification = buildNotification({ read: false });
      const response = buildListResponse({
        unread_count: 1,
        notifications: [unreadNotification],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      });
      const params: NotificationFilters = { read: false };
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await notificationsService.list(params);

      expect(mockedApiClient.get).toHaveBeenCalledWith("/notifications", {
        params: { read: false },
      });
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].read).toBe(false);
    });

    it("should call GET /notifications with read filter set to true", async () => {
      const readNotification = buildNotification({ read: true });
      const response = buildListResponse({
        unread_count: 0,
        notifications: [readNotification],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      });
      const params: NotificationFilters = { read: true };
      mockedApiClient.get.mockResolvedValueOnce(response);

      await notificationsService.list(params);

      expect(mockedApiClient.get).toHaveBeenCalledWith("/notifications", {
        params: { read: true },
      });
    });

    it("should return an empty list when there are no notifications", async () => {
      const response = buildListResponse({
        unread_count: 0,
        notifications: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
      });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await notificationsService.list();

      expect(result.notifications).toHaveLength(0);
      expect(result.unread_count).toBe(0);
    });

    it("should reject when the API call fails", async () => {
      const error = new Error("Network error");
      mockedApiClient.get.mockRejectedValueOnce(error);

      await expect(notificationsService.list()).rejects.toThrow("Network error");
    });

    it("should return correct unread_count from the response", async () => {
      const response = buildListResponse({ unread_count: 5 });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await notificationsService.list();

      expect(result.unread_count).toBe(5);
    });

    it("should handle all notification types in the response", async () => {
      const notifications: Notification[] = [
        buildNotification({ type: "NEW_RESERVATION" }),
        buildNotification({ id: "n2", type: "ORDER_DELIVERED" }),
        buildNotification({ id: "n3", type: "NEW_MESSAGE" }),
        buildNotification({ id: "n4", type: "PUBLICATION_EXPIRING" }),
        buildNotification({ id: "n5", type: "PUBLICATION_EXPIRED" }),
        buildNotification({ id: "n6", type: "RESERVATION_CANCELLED_BY_CONSUMER" }),
        buildNotification({ id: "n7", type: "RESERVATION_CANCELLED_BY_COMMERCE" }),
      ];
      const response = buildListResponse({
        notifications,
        pagination: { page: 1, limit: 10, total: 7, total_pages: 1 },
      });
      mockedApiClient.get.mockResolvedValueOnce(response);

      const result = await notificationsService.list();

      expect(result.notifications).toHaveLength(7);
    });
  });

  describe("markRead", () => {
    it("should call PUT /notifications/:id/read with the correct id", async () => {
      mockedApiClient.put.mockResolvedValueOnce(undefined);

      await notificationsService.markRead("notif-uuid-1");

      expect(mockedApiClient.put).toHaveBeenCalledTimes(1);
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/notifications/notif-uuid-1/read"
      );
    });

    it("should call PUT with a different notification id", async () => {
      mockedApiClient.put.mockResolvedValueOnce(undefined);

      await notificationsService.markRead("notif-uuid-99");

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/notifications/notif-uuid-99/read"
      );
    });

    it("should resolve to void on success", async () => {
      mockedApiClient.put.mockResolvedValueOnce(undefined);

      const result = await notificationsService.markRead("notif-uuid-1");

      expect(result).toBeUndefined();
    });

    it("should reject when the API call fails", async () => {
      const error = new Error("Not found");
      mockedApiClient.put.mockRejectedValueOnce(error);

      await expect(notificationsService.markRead("invalid-id")).rejects.toThrow(
        "Not found"
      );
    });
  });

  describe("markAllRead", () => {
    it("should call PUT /notifications/read-all", async () => {
      mockedApiClient.put.mockResolvedValueOnce(undefined);

      await notificationsService.markAllRead();

      expect(mockedApiClient.put).toHaveBeenCalledTimes(1);
      expect(mockedApiClient.put).toHaveBeenCalledWith("/notifications/read-all");
    });

    it("should resolve to void on success", async () => {
      mockedApiClient.put.mockResolvedValueOnce(undefined);

      const result = await notificationsService.markAllRead();

      expect(result).toBeUndefined();
    });

    it("should not pass any arguments to the endpoint", async () => {
      mockedApiClient.put.mockResolvedValueOnce(undefined);

      await notificationsService.markAllRead();

      expect(mockedApiClient.put).toHaveBeenCalledWith("/notifications/read-all");
      expect(mockedApiClient.put).not.toHaveBeenCalledWith(
        "/notifications/read-all",
        expect.anything()
      );
    });

    it("should reject when the API call fails", async () => {
      const error = new Error("Unauthorized");
      mockedApiClient.put.mockRejectedValueOnce(error);

      await expect(notificationsService.markAllRead()).rejects.toThrow(
        "Unauthorized"
      );
    });
  });
});
