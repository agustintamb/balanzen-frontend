import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type {
  Notification,
  NotificationType,
} from "@/api/notifications/notifications.types";
import Icon, { type IconColor, type IconName } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";
import { formatTimeAgo } from "@/utils/format";

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

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: string) => void;
}

const NotificationItem = React.memo(
  ({ notification, onPress }: NotificationItemProps) => {
    const config = NOTIFICATION_CONFIG[notification.type] ?? FALLBACK_CONFIG;
    const isUnread = !notification.read;

    return (
      <Pressable onPress={() => onPress(notification.id)} style={{ flex: 1 }}>
        <LinearGradient
          colors={
            isUnread
              ? ["rgba(234, 243, 222, 0.35)", "#ffffff"]
              : ["#ffffff", "#ffffff"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
          className="flex-row items-start gap-3 px-4 py-4"
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
                "text-sm leading-5",
                isUnread
                  ? "font-sans-semibold text-primary-dark"
                  : "font-sans text-gray-500",
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

          <View className="w-3 shrink-0 items-center pt-1">
            {isUnread && <View className="w-3 h-3 rounded-full bg-error" />}
          </View>
        </LinearGradient>
      </Pressable>
    );
  },
);

NotificationItem.displayName = "NotificationItem";

export default NotificationItem;
