import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatsService } from "@/api/chats/chats.service";
import {
  Chat,
  ChatMessagesParams,
  Message,
  MessageListResponse,
} from "@/api/chats/chats.types";

export const useChats = () =>
  useQuery<Chat[], Error>({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await chatsService.list();
      return res.chats;
    },
    staleTime: 1000 * 30,
  });

export const useChatMessages = (orderId: string, params?: ChatMessagesParams) =>
  useQuery<MessageListResponse, Error>({
    queryKey: ["chats", orderId, "messages", params],
    queryFn: () => chatsService.getMessages(orderId, params),
    enabled: !!orderId,
    staleTime: 1000 * 10,
  });

export const useSendMessage = (orderId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Message, Error, string>({
    mutationFn: (content) => chatsService.sendMessage(orderId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chats", orderId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
