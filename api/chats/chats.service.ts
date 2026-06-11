import {
  ChatListResponse,
  ChatMessagesParams,
  Message,
  MessageListResponse,
} from "@/api/chats/chats.types";
import apiClient from "@/api/client";

export const chatsService = {
  list: (): Promise<ChatListResponse> => apiClient.get("/chats"),

  getMessages: (
    orderId: string,
    params?: ChatMessagesParams,
  ): Promise<MessageListResponse> =>
    apiClient.get(`/chats/${orderId}/messages`, { params }),

  sendMessage: (orderId: string, content: string): Promise<Message> =>
    apiClient.post(`/chats/${orderId}/messages`, { content }),
};
