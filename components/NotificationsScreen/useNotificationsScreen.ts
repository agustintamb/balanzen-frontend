import { useRouter } from "expo-router";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";

export const useNotificationsScreen = () => {
  const router = useRouter();

  const { data, isLoading, isError, refetch, isRefetching } =
    useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } =
    useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  const handleBack = () => router.back();

  const handlePressNotification = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification && !notification.read) {
      markRead(id);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllRead();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isRefetching,
    isMarkingAll,
    handleBack,
    handlePressNotification,
    handleMarkAllRead,
    refetch,
  };
};
