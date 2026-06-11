import { renderHook, waitFor } from "@testing-library/react-native";
import createWrapper from "@/__test-utils__/createWrapper";
import { chatsService } from "@/api/chats/chats.service";
import {
  Chat,
  ChatListResponse,
  ChatMessagesParams,
  Message,
  MessageListResponse,
} from "@/api/chats/chats.types";
import { useChatMessages, useChats, useSendMessage } from "@/hooks/useChats";

jest.mock("@/api/chats/chats.service", () => ({
  chatsService: {
    list: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
  },
}));

const mockChatsService = chatsService as jest.Mocked<typeof chatsService>;

const buildChat = (overrides: Partial<Chat> = {}): Chat => ({
  order_id: "order-1",
  counterpart: {
    id: "user-2",
    first_name: "Maria",
    last_name: "Lopez",
    photo_url: null,
  },
  publication_title: "Pan integral",
  last_message: {
    content: "Hola, ¿puedo retirar mañana?",
    sender_id: "user-2",
    created_at: "2026-05-01T10:00:00Z",
  },
  unread_count: 1,
  order_status: "RESERVED",
  ...overrides,
});

const buildMessage = (overrides: Partial<Message> = {}): Message => ({
  id: "msg-1",
  order_id: "order-1",
  sender_id: "user-1",
  content: "Hola",
  created_at: "2026-05-01T10:00:00Z",
  ...overrides,
});

const buildMessageListResponse = (
  overrides: Partial<MessageListResponse> = {},
): MessageListResponse => ({
  messages: [buildMessage()],
  pagination: { page: 1, limit: 20, total: 1, total_pages: 1 },
  ...overrides,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("useChats", () => {
  describe("useChats()", () => {
    it("should return chats array when fetched successfully", async () => {
      const chats: Chat[] = [buildChat(), buildChat({ order_id: "order-2" })];
      const response: ChatListResponse = { chats };
      mockChatsService.list.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(chats);
      expect(result.current.data).toHaveLength(2);
    });

    it("should call chatsService.list once on mount", async () => {
      mockChatsService.list.mockResolvedValueOnce({ chats: [] });

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockChatsService.list).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array when the API returns no chats", async () => {
      mockChatsService.list.mockResolvedValueOnce({ chats: [] });

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it("should return error state when chatsService.list rejects", async () => {
      mockChatsService.list.mockRejectedValueOnce(new Error("Network Error"));

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Network Error");
    });

    it("should unwrap the chats array from the ChatListResponse", async () => {
      const chat = buildChat({
        order_id: "order-99",
        publication_title: "Croissants",
      });
      mockChatsService.list.mockResolvedValueOnce({ chats: [chat] });

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.[0].order_id).toBe("order-99");
      expect(result.current.data?.[0].publication_title).toBe("Croissants");
    });

    it("should return a chat with a commerce counterpart that has a business_name", async () => {
      const chat = buildChat({
        counterpart: {
          id: "commerce-5",
          first_name: "La",
          last_name: "Panadería",
          photo_url: "https://cdn.example.com/logo.jpg",
          business_name: "La Panadería SRL",
        },
      });
      mockChatsService.list.mockResolvedValueOnce({ chats: [chat] });

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.[0].counterpart.business_name).toBe(
        "La Panadería SRL",
      );
    });

    it("should return a chat with null last_message when no messages have been sent", async () => {
      const chat = buildChat({ last_message: null });
      mockChatsService.list.mockResolvedValueOnce({ chats: [chat] });

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.[0].last_message).toBeNull();
    });

    it("should be in loading state initially before data resolves", async () => {
      let resolvePromise!: (value: ChatListResponse) => void;
      mockChatsService.list.mockReturnValueOnce(
        new Promise<ChatListResponse>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const { result } = renderHook(() => useChats(), {
        wrapper: createWrapper().wrapper,
      });

      expect(result.current.isPending).toBe(true);

      resolvePromise({ chats: [] });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe("useChatMessages(orderId, params)", () => {
    it("should return messages when fetched successfully with a valid orderId", async () => {
      const response = buildMessageListResponse();
      mockChatsService.getMessages.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useChatMessages("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(response);
      expect(mockChatsService.getMessages).toHaveBeenCalledWith(
        "order-1",
        undefined,
      );
    });

    it("should call chatsService.getMessages with orderId and pagination params", async () => {
      const params: ChatMessagesParams = { page: 2, limit: 20 };
      mockChatsService.getMessages.mockResolvedValueOnce(
        buildMessageListResponse(),
      );

      const { result } = renderHook(() => useChatMessages("order-1", params), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockChatsService.getMessages).toHaveBeenCalledWith(
        "order-1",
        params,
      );
    });

    it("should not fetch when orderId is an empty string", async () => {
      const { result } = renderHook(() => useChatMessages(""), {
        wrapper: createWrapper().wrapper,
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockChatsService.getMessages).not.toHaveBeenCalled();
    });

    it("should return error state when chatsService.getMessages rejects", async () => {
      mockChatsService.getMessages.mockRejectedValueOnce(
        new Error("Forbidden"),
      );

      const { result } = renderHook(() => useChatMessages("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Forbidden");
    });

    it("should return an empty messages list when there are no messages for the order", async () => {
      const emptyResponse = buildMessageListResponse({
        messages: [],
        pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
      });
      mockChatsService.getMessages.mockResolvedValueOnce(emptyResponse);

      const { result } = renderHook(() => useChatMessages("order-empty"), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.messages).toHaveLength(0);
    });

    it("should return multiple messages with correct content and senders", async () => {
      const response = buildMessageListResponse({
        messages: [
          buildMessage({ id: "msg-1", sender_id: "user-1", content: "Hola" }),
          buildMessage({
            id: "msg-2",
            sender_id: "user-2",
            content: "Buenas!",
          }),
          buildMessage({
            id: "msg-3",
            sender_id: "user-1",
            content: "¿Puedo retirar hoy?",
          }),
        ],
        pagination: { page: 1, limit: 20, total: 3, total_pages: 1 },
      });
      mockChatsService.getMessages.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useChatMessages("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.messages).toHaveLength(3);
      expect(result.current.data?.messages[1].content).toBe("Buenas!");
    });

    it("should pass different orderIds correctly in the query", async () => {
      mockChatsService.getMessages.mockResolvedValueOnce(
        buildMessageListResponse(),
      );

      const { result } = renderHook(() => useChatMessages("order-uuid-9999"), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockChatsService.getMessages).toHaveBeenCalledWith(
        "order-uuid-9999",
        undefined,
      );
    });

    it("should return a message with an optional order_id field", async () => {
      const msgWithoutOrderId = buildMessage({ order_id: undefined });
      mockChatsService.getMessages.mockResolvedValueOnce(
        buildMessageListResponse({ messages: [msgWithoutOrderId] }),
      );

      const { result } = renderHook(() => useChatMessages("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.messages[0].order_id).toBeUndefined();
    });
  });

  describe("useSendMessage(orderId)", () => {
    it("should send a message and return the created Message on success", async () => {
      const sent = buildMessage({ id: "msg-new", content: "Confirmado" });
      mockChatsService.sendMessage.mockResolvedValueOnce(sent);

      const { result } = renderHook(() => useSendMessage("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate("Confirmado");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(sent);
      expect(mockChatsService.sendMessage).toHaveBeenCalledWith(
        "order-1",
        "Confirmado",
      );
    });

    it("should call mutateAsync with content and resolve with the sent Message", async () => {
      const sent = buildMessage({ content: "Perfecto" });
      mockChatsService.sendMessage.mockResolvedValueOnce(sent);

      const { result } = renderHook(() => useSendMessage("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      const message = await result.current.mutateAsync("Perfecto");

      expect(message).toEqual(sent);
    });

    it("should return error state when chatsService.sendMessage rejects", async () => {
      mockChatsService.sendMessage.mockRejectedValueOnce(
        new Error("Service Unavailable"),
      );

      const { result } = renderHook(() => useSendMessage("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate("Hola");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Service Unavailable");
    });

    it("should be in idle state before the mutation is called", () => {
      const { result } = renderHook(() => useSendMessage("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      expect(result.current.status).toBe("idle");
      expect(mockChatsService.sendMessage).not.toHaveBeenCalled();
    });

    it("should pass the orderId and content correctly to chatsService.sendMessage", async () => {
      mockChatsService.sendMessage.mockResolvedValueOnce(buildMessage());

      const { result } = renderHook(() => useSendMessage("order-xyz"), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate("¿A qué hora puedo pasar?");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockChatsService.sendMessage).toHaveBeenCalledWith(
        "order-xyz",
        "¿A qué hora puedo pasar?",
      );
    });

    it("should use the orderId provided at hook initialization for every mutation call", async () => {
      mockChatsService.sendMessage
        .mockResolvedValueOnce(
          buildMessage({ id: "msg-a", content: "Mensaje 1" }),
        )
        .mockResolvedValueOnce(
          buildMessage({ id: "msg-b", content: "Mensaje 2" }),
        );

      const { result } = renderHook(() => useSendMessage("order-static"), {
        wrapper: createWrapper().wrapper,
      });

      await result.current.mutateAsync("Mensaje 1");
      await result.current.mutateAsync("Mensaje 2");

      expect(mockChatsService.sendMessage).toHaveBeenNthCalledWith(
        1,
        "order-static",
        "Mensaje 1",
      );
      expect(mockChatsService.sendMessage).toHaveBeenNthCalledWith(
        2,
        "order-static",
        "Mensaje 2",
      );
    });

    it("should handle sending an empty string content without throwing", async () => {
      mockChatsService.sendMessage.mockResolvedValueOnce(
        buildMessage({ content: "" }),
      );

      const { result } = renderHook(() => useSendMessage("order-1"), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate("");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockChatsService.sendMessage).toHaveBeenCalledWith("order-1", "");
    });
  });
});
