import { Pressable, Text, View } from "react-native";
import type { Notification, NotificationType } from "@/api/notifications/notifications.types";
import Icon, { type IconColor, type IconName } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

type NotificationConfig = { icon: IconName; color: IconColor };

const NOTIFICATION_CONFIG: Record<NotificationType, NotificationConfig> = {
  NEW_RESERVATION: { icon: "bookmark", color: "primary" },
  RESERVATION_CANCELLED_BY_CONSUMER: { icon: "x-circle", color: "error" },
  RESERVATION_CANCELLED_BY_COMMERCE: { icon: "x-circle", color: "error" },
  ORDER_DELIVERED: { icon: "check-circle", color: "primary" },
  NEW_MESSAGE: { icon: "message-circle", color: "neutral" },
  PUBLICATION_EXPIRING: { icon: "clock", color: "warning" },
  PUBLICATION_EXPIRED: { icon: "alert-circle", color: "warning" },
};

const FALLBACK_CONFIG: NotificationConfig = { icon: "bell", color: "neutral" };

const formatTimeAgo = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return new Date(isoDate).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
};

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: string) => void;
}

const NotificationItem = ({ notification, onPress }: NotificationItemProps) => {
  const config = NOTIFICATION_CONFIG[notification.type] ?? FALLBACK_CONFIG;
  const isUnread = !notification.read;

  return (
    <Pressable
      onPress={() => onPress(notification.id)}
      style={CARD_SHADOW}
      className="flex-row items-start gap-3 px-4 py-4 rounded-2xl bg-white"
    >
      <View className="shrink-0">
        <Icon
          name={config.icon}
          size={20}
          variant="soft"
          color={config.color}
          containerSize={46}
        />
      </View>

      <View className="flex-1 gap-0.5 pt-0.5">
        <Text
          className={cn(
            "text-sm text-primary-dark leading-5",
            isUnread ? "font-sans-semibold" : "font-sans-medium",
          )}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text
          className="font-sans text-sm text-gray-500 leading-5 mt-0.5"
          numberOfLines={2}
        >
          {notification.message}
        </Text>
        <Text className="font-sans text-xs text-gray-400 mt-1.5">
          {formatTimeAgo(notification.created_at)}
        </Text>
      </View>

      {isUnread ? (
        <View className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
      ) : (
        <View className="w-2 shrink-0" />
      )}
    </Pressable>
  );
};

export default NotificationItem;
