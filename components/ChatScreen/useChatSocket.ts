import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/auth.store";

interface NewMessagePayload {
  order_id: string;
  sender_id: string;
  content: string;
  timestamp: string;
}

interface UserTypingPayload {
  order_id: string;
  user_id: string;
  is_typing: boolean;
}

export const useChatSocket = (orderId: string) => {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const userId = useAuthStore((s) => s.user?.id);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const ready = isConnected && !!orderId;

  useEffect(() => {
    if (!socket || !ready) return;
    socket.emit("join_chat", { order_id: orderId });
    return () => {
      socket.emit("leave_chat", { order_id: orderId });
      setIsOtherTyping(false);
    };
  }, [socket, ready, orderId]);

  useSocketEvent(
    "new_message",
    (payload: NewMessagePayload) => {
      if (payload?.order_id !== orderId) return;
      queryClient.invalidateQueries({
        queryKey: ["chats", orderId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    ready,
  );

  useSocketEvent(
    "user_typing",
    (payload: UserTypingPayload) => {
      if (payload?.order_id !== orderId || payload.user_id === userId) return;
      setIsOtherTyping(payload.is_typing);
    },
    ready,
  );

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !ready) return;
      socket.emit("typing", { order_id: orderId, is_typing: isTyping });
    },
    [socket, ready, orderId],
  );

  return { isOtherTyping, notifyTyping };
};
