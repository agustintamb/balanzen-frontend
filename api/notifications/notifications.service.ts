import apiClient from "@/api/client";
import {
  NotificationFilters,
  NotificationListResponse,
} from "@/api/notifications/notifications.types";

export const notificationsService = {
  list: (params?: NotificationFilters): Promise<NotificationListResponse> =>
    apiClient.get("/notifications", { params }),

  markRead: (id: string): Promise<void> =>
    apiClient.put(`/notifications/${id}/read`),

  markAllRead: (): Promise<void> => apiClient.put("/notifications/read-all"),
};
