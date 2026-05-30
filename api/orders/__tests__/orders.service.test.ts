import apiClient from "@/api/client";
import { ordersService } from "@/api/orders/orders.service";
import type {
  Order,
  OrderCommerce,
  OrderConsumer,
  OrderListResponse,
  OrderPublication,
  OrderStatus,
} from "@/api/orders/orders.types";

jest.mock("@/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// --- Fixtures ---

const mockPublication: OrderPublication = {
  id: "pub-uuid-001",
  title: "Pan integral por vencer",
  final_price: 350.5,
  photos: ["https://cdn.example.com/photo1.jpg"],
};

const mockCommerce: OrderCommerce = {
  id: "commerce-uuid-001",
  business_name: "Panadería Central",
  selected_address: {
    formatted_address: "Av. Corrientes 1234, Buenos Aires",
  },
};

const mockConsumer: OrderConsumer = {
  id: "consumer-uuid-001",
  first_name: "Juan",
  last_name: "Pérez",
};

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "order-uuid-001",
  publication: mockPublication,
  consumer: mockConsumer,
  commerce: mockCommerce,
  status: "RESERVED",
  created_at: "2026-05-30T10:00:00.000Z",
  ...overrides,
});

const buildOrderListResponse = (
  orders: Order[] = [],
  overrides: Partial<OrderListResponse> = {},
): OrderListResponse => ({
  orders,
  pagination: {
    page: 1,
    limit: 10,
    total: orders.length,
    total_pages: 1,
  },
  ...overrides,
});

// --- Tests ---

describe("ordersService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // create
  // -------------------------
  describe("create", () => {
    it("should call apiClient.post with /orders endpoint", async () => {
      const order = buildOrder();
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.create("pub-uuid-001");

      expect(mockApiClient.post).toHaveBeenCalledWith("/orders", {
        publication_id: "pub-uuid-001",
      });
    });

    it("should pass publication_id in the request body", async () => {
      const order = buildOrder({ id: "order-uuid-999" });
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.create("pub-uuid-special");

      expect(mockApiClient.post).toHaveBeenCalledWith("/orders", {
        publication_id: "pub-uuid-special",
      });
    });

    it("should return the Order returned by the API", async () => {
      const order = buildOrder({ id: "order-uuid-002" });
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(order);

      const result = await ordersService.create("pub-uuid-001");

      expect(result).toEqual(order);
    });

    it("should return an Order with RESERVED status on creation", async () => {
      const order = buildOrder({ status: "RESERVED" });
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(order);

      const result = await ordersService.create("pub-uuid-001");

      expect(result.status).toBe("RESERVED");
    });

    it("should call apiClient.post exactly once", async () => {
      const order = buildOrder();
      (mockApiClient.post as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.create("pub-uuid-001");

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it("should propagate error when apiClient.post rejects", async () => {
      const networkError = new Error("Network error");
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(ordersService.create("pub-uuid-001")).rejects.toThrow(
        "Network error",
      );
    });

    it("should propagate 422 validation error from apiClient.post", async () => {
      const validationError = Object.assign(new Error("Unprocessable Entity"), {
        response: { status: 422 },
      });
      (mockApiClient.post as jest.Mock).mockRejectedValueOnce(validationError);

      await expect(ordersService.create("pub-uuid-001")).rejects.toThrow(
        "Unprocessable Entity",
      );
    });
  });

  // -------------------------
  // list
  // -------------------------
  describe("list", () => {
    it("should call apiClient.get with /orders endpoint", async () => {
      const response = buildOrderListResponse([buildOrder()]);
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      await ordersService.list();

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders", {
        params: undefined,
      });
    });

    it("should pass status filter param when provided", async () => {
      const response = buildOrderListResponse([]);
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      const status: OrderStatus = "RESERVED";
      await ordersService.list({ status });

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders", {
        params: { status: "RESERVED" },
      });
    });

    it("should pass DELIVERED status filter correctly", async () => {
      const order = buildOrder({ status: "DELIVERED" });
      const response = buildOrderListResponse([order]);
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      await ordersService.list({ status: "DELIVERED" });

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders", {
        params: { status: "DELIVERED" },
      });
    });

    it("should pass CANCELLED status filter correctly", async () => {
      const response = buildOrderListResponse([]);
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      await ordersService.list({ status: "CANCELLED" });

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders", {
        params: { status: "CANCELLED" },
      });
    });

    it("should pass pagination params when provided", async () => {
      const response = buildOrderListResponse([], {
        pagination: { page: 2, limit: 5, total: 12, total_pages: 3 },
      });
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      await ordersService.list({ page: 2, limit: 5 });

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders", {
        params: { page: 2, limit: 5 },
      });
    });

    it("should pass combined status and pagination params", async () => {
      const response = buildOrderListResponse([]);
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      await ordersService.list({ status: "RESERVED", page: 1, limit: 10 });

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders", {
        params: { status: "RESERVED", page: 1, limit: 10 },
      });
    });

    it("should return the OrderListResponse with orders array", async () => {
      const orders = [buildOrder(), buildOrder({ id: "order-uuid-002" })];
      const response = buildOrderListResponse(orders, {
        pagination: { page: 1, limit: 10, total: 2, total_pages: 1 },
      });
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      const result = await ordersService.list();

      expect(result.orders).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it("should return an empty orders array when no results", async () => {
      const response = buildOrderListResponse([]);
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      const result = await ordersService.list({ status: "CANCELLED" });

      expect(result.orders).toHaveLength(0);
    });

    it("should call apiClient.get exactly once", async () => {
      const response = buildOrderListResponse([]);
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

      await ordersService.list();

      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it("should propagate error when apiClient.get rejects", async () => {
      const serverError = new Error("Internal Server Error");
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(serverError);

      await expect(ordersService.list()).rejects.toThrow(
        "Internal Server Error",
      );
    });
  });

  // -------------------------
  // getById
  // -------------------------
  describe("getById", () => {
    it("should call apiClient.get with the correct URL including the id", async () => {
      const order = buildOrder({ id: "order-uuid-abc" });
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.getById("order-uuid-abc");

      expect(mockApiClient.get).toHaveBeenCalledWith("/orders/order-uuid-abc");
    });

    it("should return the Order with matching id", async () => {
      const order = buildOrder({ id: "order-uuid-abc" });
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(order);

      const result = await ordersService.getById("order-uuid-abc");

      expect(result.id).toBe("order-uuid-abc");
    });

    it("should return an Order with full nested publication data", async () => {
      const order = buildOrder();
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(order);

      const result = await ordersService.getById("order-uuid-001");

      expect(result.publication).toEqual(mockPublication);
      expect(result.commerce).toEqual(mockCommerce);
      expect(result.consumer).toEqual(mockConsumer);
    });

    it("should call apiClient.get exactly once", async () => {
      const order = buildOrder();
      (mockApiClient.get as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.getById("order-uuid-001");

      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it("should propagate 404 error when order is not found", async () => {
      const notFoundError = Object.assign(new Error("Not Found"), {
        response: { status: 404 },
      });
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(notFoundError);

      await expect(ordersService.getById("nonexistent-id")).rejects.toThrow(
        "Not Found",
      );
    });

    it("should propagate network error from apiClient.get", async () => {
      const networkError = new Error("Request timeout");
      (mockApiClient.get as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(ordersService.getById("order-uuid-001")).rejects.toThrow(
        "Request timeout",
      );
    });
  });

  // -------------------------
  // cancel
  // -------------------------
  describe("cancel", () => {
    it("should call apiClient.put with the correct cancel URL", async () => {
      const order = buildOrder({ status: "CANCELLED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.cancel("order-uuid-001");

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/orders/order-uuid-001/cancel",
      );
    });

    it("should return the updated Order with CANCELLED status", async () => {
      const order = buildOrder({ status: "CANCELLED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      const result = await ordersService.cancel("order-uuid-001");

      expect(result.status).toBe("CANCELLED");
    });

    it("should include the correct order id in the cancel URL", async () => {
      const order = buildOrder({ id: "order-uuid-special", status: "CANCELLED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.cancel("order-uuid-special");

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/orders/order-uuid-special/cancel",
      );
    });

    it("should not call apiClient.post for cancel", async () => {
      const order = buildOrder({ status: "CANCELLED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.cancel("order-uuid-001");

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it("should call apiClient.put exactly once", async () => {
      const order = buildOrder({ status: "CANCELLED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.cancel("order-uuid-001");

      expect(mockApiClient.put).toHaveBeenCalledTimes(1);
    });

    it("should propagate error when apiClient.put rejects", async () => {
      const conflictError = Object.assign(new Error("Conflict"), {
        response: { status: 409 },
      });
      (mockApiClient.put as jest.Mock).mockRejectedValueOnce(conflictError);

      await expect(ordersService.cancel("order-uuid-001")).rejects.toThrow(
        "Conflict",
      );
    });

    it("should propagate 403 error when cancellation is not allowed", async () => {
      const forbiddenError = Object.assign(new Error("Forbidden"), {
        response: { status: 403 },
      });
      (mockApiClient.put as jest.Mock).mockRejectedValueOnce(forbiddenError);

      await expect(ordersService.cancel("order-uuid-001")).rejects.toThrow(
        "Forbidden",
      );
    });
  });

  // -------------------------
  // deliver
  // -------------------------
  describe("deliver", () => {
    it("should call apiClient.put with the correct deliver URL", async () => {
      const order = buildOrder({ status: "DELIVERED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.deliver("order-uuid-001");

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/orders/order-uuid-001/deliver",
      );
    });

    it("should return the updated Order with DELIVERED status", async () => {
      const order = buildOrder({ status: "DELIVERED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      const result = await ordersService.deliver("order-uuid-001");

      expect(result.status).toBe("DELIVERED");
    });

    it("should include the correct order id in the deliver URL", async () => {
      const order = buildOrder({ id: "order-uuid-xyz", status: "DELIVERED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.deliver("order-uuid-xyz");

      expect(mockApiClient.put).toHaveBeenCalledWith(
        "/orders/order-uuid-xyz/deliver",
      );
    });

    it("should not call apiClient.post for deliver", async () => {
      const order = buildOrder({ status: "DELIVERED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.deliver("order-uuid-001");

      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it("should call apiClient.put exactly once", async () => {
      const order = buildOrder({ status: "DELIVERED" });
      (mockApiClient.put as jest.Mock).mockResolvedValueOnce(order);

      await ordersService.deliver("order-uuid-001");

      expect(mockApiClient.put).toHaveBeenCalledTimes(1);
    });

    it("should propagate error when apiClient.put rejects", async () => {
      const serverError = new Error("Internal Server Error");
      (mockApiClient.put as jest.Mock).mockRejectedValueOnce(serverError);

      await expect(ordersService.deliver("order-uuid-001")).rejects.toThrow(
        "Internal Server Error",
      );
    });

    it("should propagate 403 error when delivery is not allowed", async () => {
      const forbiddenError = Object.assign(new Error("Forbidden"), {
        response: { status: 403 },
      });
      (mockApiClient.put as jest.Mock).mockRejectedValueOnce(forbiddenError);

      await expect(ordersService.deliver("order-uuid-001")).rejects.toThrow(
        "Forbidden",
      );
    });
  });

  // -------------------------
  // OrderStatus type guard
  // -------------------------
  describe("OrderStatus values used as filter params", () => {
    const statuses: OrderStatus[] = ["RESERVED", "DELIVERED", "CANCELLED"];

    it.each(statuses)(
      "should pass %s status correctly to apiClient.get",
      async (status) => {
        const orders = status === "RESERVED" ? [buildOrder({ status })] : [];
        const response = buildOrderListResponse(orders);
        (mockApiClient.get as jest.Mock).mockResolvedValueOnce(response);

        await ordersService.list({ status });

        expect(mockApiClient.get).toHaveBeenCalledWith("/orders", {
          params: { status },
        });
      },
    );
  });
});
