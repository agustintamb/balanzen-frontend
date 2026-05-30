import apiClient from "@/api/client";
import { chatsService } from "@/api/chats/chats.service";
import type {
  Chat,
  ChatListResponse,
  ChatMessagesParams,
  Message,
  MessageListResponse,
} from "@/api/chats/chats.types";
import type { Pagination } from "@/api/shared.types";

jest.mock("@/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ── fixtures ──────────────────────────────────────────────────────────────────

const mockMessage: Message = {
  id: "msg-uuid-001",
  order_id: "order-uuid-001",
  sender_id: "user-uuid-001",
  content: "Hola, ¿a qué hora puedo retirar?",
  created_at: "2026-05-30T10:00:00.000Z",
};

const mockChat: Chat = {
  order_id: "order-uuid-001",
  counterpart: {
    id: "user-uuid-002",
    first_name: "Ana",
    last_name: "García",
    photo_url: "https://cdn.example.com/photos/ana.jpg",
    business_name: "La Panadería",
  },
  publication_title: "Pan integral con semillas",
  last_message: {
    content: "Hola, ¿a qué hora puedo retirar?",
    sender_id: "user-uuid-001",
    created_at: "2026-05-30T10:00:00.000Z",
  },
  unread_count: 2,
  order_status: "RESERVED",
};

const mockPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 5,
  total_pages: 1,
};

const mockChatListResponse: ChatListResponse = {
  chats: [mockChat],
};

const mockMessageListResponse: MessageListResponse = {
  messages: [mockMessage],
  pagination: mockPagination,
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe("chatsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── list ───────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("should call GET /chats with no parameters", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockChatListResponse);

      await chatsService.list();

      expect(mockApiClient.get).toHaveBeenCalledWith("/chats");
    });

    it("should call GET /chats exactly once", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockChatListResponse);

      await chatsService.list();

      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it("should return the chat list response on success", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockChatListResponse);

      const result = await chatsService.list();

      expect(result).toEqual(mockChatListResponse);
    });

    it("should return a response with an empty chats array when no chats exist", async () => {
      const emptyResponse: ChatListResponse = { chats: [] };
      mockApiClient.get.mockResolvedValueOnce(emptyResponse);

      const result = await chatsService.list();

      expect(result.chats).toHaveLength(0);
    });

    it("should return a chat with null last_message when no messages have been sent", async () => {
      const chatWithNoMessages: Chat = { ...mockChat, last_message: null };
      mockApiClient.get.mockResolvedValueOnce({
        chats: [chatWithNoMessages],
      });

      const result = await chatsService.list();

      expect(result.chats[0].last_message).toBeNull();
    });

    it("should return a chat with a counterpart that has no business_name when the counterpart is a consumer", async () => {
      const consumerChat: Chat = {
        ...mockChat,
        counterpart: {
          id: "user-uuid-003",
          first_name: "Carlos",
          last_name: "López",
          photo_url: null,
        },
      };
      mockApiClient.get.mockResolvedValueOnce({ chats: [consumerChat] });

      const result = await chatsService.list();

      expect(result.chats[0].counterpart.business_name).toBeUndefined();
    });

    it("should propagate the error when GET /chats rejects", async () => {
      const networkError = new Error("Network Error");
      mockApiClient.get.mockRejectedValueOnce(networkError);

      await expect(chatsService.list()).rejects.toThrow("Network Error");
    });

    it("should propagate a 401 error when the user is not authenticated", async () => {
      const authError = new Error("Unauthorized");
      mockApiClient.get.mockRejectedValueOnce(authError);

      await expect(chatsService.list()).rejects.toThrow("Unauthorized");
    });
  });

  // ── getMessages ────────────────────────────────────────────────────────────

  describe("getMessages", () => {
    it("should call GET /chats/:orderId/messages with the correct orderId", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMessageListResponse);

      await chatsService.getMessages("order-uuid-001");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/chats/order-uuid-001/messages",
        { params: undefined },
      );
    });

    it("should call GET /chats/:orderId/messages exactly once", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMessageListResponse);

      await chatsService.getMessages("order-uuid-001");

      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it("should pass pagination params when provided", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMessageListResponse);
      const params: ChatMessagesParams = { page: 2, limit: 10 };

      await chatsService.getMessages("order-uuid-001", params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/chats/order-uuid-001/messages",
        { params },
      );
    });

    it("should pass undefined params when called without the params argument", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMessageListResponse);

      await chatsService.getMessages("order-uuid-001");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/chats/order-uuid-001/messages",
        { params: undefined },
      );
    });

    it("should return the message list response with pagination on success", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMessageListResponse);

      const result = await chatsService.getMessages("order-uuid-001");

      expect(result).toEqual(mockMessageListResponse);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("should return an empty messages array when the chat has no messages", async () => {
      const emptyResponse: MessageListResponse = {
        messages: [],
        pagination: { ...mockPagination, total: 0 },
      };
      mockApiClient.get.mockResolvedValueOnce(emptyResponse);

      const result = await chatsService.getMessages("order-uuid-001");

      expect(result.messages).toHaveLength(0);
    });

    it("should use the correct dynamic orderId segment in the URL for different order IDs", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockMessageListResponse);

      await chatsService.getMessages("order-uuid-999");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        "/chats/order-uuid-999/messages",
        { params: undefined },
      );
    });

    it("should return a message without order_id when the field is absent", async () => {
      const messageWithoutOrderId: Message = {
        id: "msg-uuid-002",
        sender_id: "user-uuid-001",
        content: "Gracias!",
        created_at: "2026-05-30T11:00:00.000Z",
      };
      mockApiClient.get.mockResolvedValueOnce({
        messages: [messageWithoutOrderId],
        pagination: mockPagination,
      });

      const result = await chatsService.getMessages("order-uuid-001");

      expect(result.messages[0].order_id).toBeUndefined();
    });

    it("should propagate the error when GET /chats/:orderId/messages rejects", async () => {
      const networkError = new Error("Network Error");
      mockApiClient.get.mockRejectedValueOnce(networkError);

      await expect(
        chatsService.getMessages("order-uuid-001"),
      ).rejects.toThrow("Network Error");
    });

    it("should propagate a 404 error when the order does not exist", async () => {
      const notFoundError = new Error("Not Found");
      mockApiClient.get.mockRejectedValueOnce(notFoundError);

      await expect(
        chatsService.getMessages("nonexistent-order"),
      ).rejects.toThrow("Not Found");
    });
  });

  // ── sendMessage ────────────────────────────────────────────────────────────

  describe("sendMessage", () => {
    it("should call POST /chats/:orderId/messages with the correct orderId and content", async () => {
      mockApiClient.post.mockResolvedValueOnce(mockMessage);

      await chatsService.sendMessage("order-uuid-001", "Hola!");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/chats/order-uuid-001/messages",
        { content: "Hola!" },
      );
    });

    it("should call POST /chats/:orderId/messages exactly once", async () => {
      mockApiClient.post.mockResolvedValueOnce(mockMessage);

      await chatsService.sendMessage("order-uuid-001", "Hola!");

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it("should return the created Message on success", async () => {
      mockApiClient.post.mockResolvedValueOnce(mockMessage);

      const result = await chatsService.sendMessage(
        "order-uuid-001",
        "Hola, ¿a qué hora puedo retirar?",
      );

      expect(result).toEqual(mockMessage);
    });

    it("should use the correct dynamic orderId segment in the URL", async () => {
      mockApiClient.post.mockResolvedValueOnce(mockMessage);

      await chatsService.sendMessage("order-uuid-555", "Mensaje de prueba");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/chats/order-uuid-555/messages",
        { content: "Mensaje de prueba" },
      );
    });

    it("should send an empty string content when the content is an empty string", async () => {
      mockApiClient.post.mockResolvedValueOnce({ ...mockMessage, content: "" });

      await chatsService.sendMessage("order-uuid-001", "");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/chats/order-uuid-001/messages",
        { content: "" },
      );
    });

    it("should send a multiline message as a single content string", async () => {
      const multiline = "Línea 1\nLínea 2";
      mockApiClient.post.mockResolvedValueOnce({
        ...mockMessage,
        content: multiline,
      });

      await chatsService.sendMessage("order-uuid-001", multiline);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        "/chats/order-uuid-001/messages",
        { content: multiline },
      );
    });

    it("should propagate the error when POST /chats/:orderId/messages rejects", async () => {
      const networkError = new Error("Network Error");
      mockApiClient.post.mockRejectedValueOnce(networkError);

      await expect(
        chatsService.sendMessage("order-uuid-001", "Hola!"),
      ).rejects.toThrow("Network Error");
    });

    it("should propagate a 403 error when the user is not a participant in the order", async () => {
      const forbiddenError = new Error("Forbidden");
      mockApiClient.post.mockRejectedValueOnce(forbiddenError);

      await expect(
        chatsService.sendMessage("order-uuid-001", "Intento de acceso"),
      ).rejects.toThrow("Forbidden");
    });
  });
});
