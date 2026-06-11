import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/api/notifications/notifications.service";
import {
  NotificationFilters,
  NotificationListResponse,
} from "@/api/notifications/notifications.types";

export const useNotifications = (params?: NotificationFilters) =>
  useQuery<NotificationListResponse, Error>({
    queryKey: ["notifications", params],
    queryFn: () => notificationsService.list(params),
    staleTime: 1000 * 30,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: notificationsService.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
