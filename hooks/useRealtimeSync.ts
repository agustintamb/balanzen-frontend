import { useQueryClient } from "@tanstack/react-query";
import type {
  NotificationType,
  ReferenceType,
} from "@/api/notifications/notifications.types";
import { useSocketEvent } from "@/hooks/useSocket";

interface NewNotificationPayload {
  id: string;
  type: NotificationType;
  reference_id?: string;
  reference_type?: ReferenceType;
}

const ORDER_TYPES = new Set<NotificationType>([
  "NEW_RESERVATION",
  "RESERVATION_CANCELLED_BY_CONSUMER",
  "RESERVATION_CANCELLED_BY_COMMERCE",
  "ORDER_DELIVERED",
]);

const PUBLICATION_TYPES = new Set<NotificationType>([
  "PUBLICATION_EXPIRING",
  "PUBLICATION_EXPIRED",
]);

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();

  useSocketEvent<NewNotificationPayload>("new_notification", (payload) => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

    const type = payload?.type;
    if (!type) return;

    if (ORDER_TYPES.has(type)) {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    }

    if (PUBLICATION_TYPES.has(type)) {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    }

    if (type === "NEW_MESSAGE") {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
      if (payload.reference_id) {
        queryClient.invalidateQueries({
          queryKey: ["chats", payload.reference_id, "messages"],
        });
      }
    }
  });

  useSocketEvent("publication_changed", () => {
    queryClient.invalidateQueries({ queryKey: ["publications"] });
  });
};
