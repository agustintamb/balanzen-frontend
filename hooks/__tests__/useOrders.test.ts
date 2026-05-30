import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { ordersService } from "@/api/orders/orders.service";
import {
  Order,
  OrderFilters,
  OrderListResponse,
} from "@/api/orders/orders.types";
import {
  useCancelOrder,
  useCreateOrder,
  useDeliverOrder,
  useOrder,
  useOrders,
} from "@/hooks/useOrders";

jest.mock("@/api/orders/orders.service", () => ({
  ordersService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    cancel: jest.fn(),
    deliver: jest.fn(),
  },
}));

const mockOrdersService = ordersService as jest.Mocked<typeof ordersService>;

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "order-1",
  publication: {
    id: "pub-1",
    title: "Pan integral",
    final_price: 250,
    photos: ["https://cdn.example.com/photo1.jpg"],
  },
  consumer: {
    id: "consumer-1",
    first_name: "Juan",
    last_name: "Perez",
  },
  commerce: {
    id: "commerce-1",
    business_name: "La Panadería",
    selected_address: { formatted_address: "Av. Corrientes 1234" },
  },
  status: "RESERVED",
  created_at: "2026-05-01T10:00:00Z",
  ...overrides,
});

const buildOrderListResponse = (
  overrides: Partial<OrderListResponse> = {},
): OrderListResponse => ({
  orders: [buildOrder()],
  pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
  ...overrides,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("useOrders", () => {
  describe("useOrders(params)", () => {
    it("should return orders list when fetched successfully without params", async () => {
      const response = buildOrderListResponse();
      mockOrdersService.list.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(response);
      expect(mockOrdersService.list).toHaveBeenCalledWith(undefined);
    });

    it("should call ordersService.list with provided filter params", async () => {
      const filters: OrderFilters = { status: "RESERVED", page: 2, limit: 5 };
      mockOrdersService.list.mockResolvedValueOnce(buildOrderListResponse());

      const { result } = renderHook(() => useOrders(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrdersService.list).toHaveBeenCalledWith(filters);
    });

    it("should return error state when ordersService.list rejects", async () => {
      mockOrdersService.list.mockRejectedValueOnce(new Error("Network Error"));

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Network Error");
    });

    it("should return empty orders list when API returns no results", async () => {
      const emptyResponse = buildOrderListResponse({
        orders: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
      });
      mockOrdersService.list.mockResolvedValueOnce(emptyResponse);

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.orders).toHaveLength(0);
    });

    it("should use queryKey ['orders', params] for caching", async () => {
      const filters: OrderFilters = { status: "DELIVERED" };
      mockOrdersService.list.mockResolvedValueOnce(buildOrderListResponse());

      const { result } = renderHook(() => useOrders(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrdersService.list).toHaveBeenCalledTimes(1);
    });

    it("should return multiple orders when response contains several", async () => {
      const response = buildOrderListResponse({
        orders: [
          buildOrder({ id: "order-1", status: "RESERVED" }),
          buildOrder({ id: "order-2", status: "DELIVERED" }),
          buildOrder({ id: "order-3", status: "CANCELLED" }),
        ],
        pagination: { page: 1, limit: 10, total: 3, total_pages: 1 },
      });
      mockOrdersService.list.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useOrders(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.orders).toHaveLength(3);
      expect(result.current.data?.pagination.total).toBe(3);
    });
  });

  describe("useOrder(id)", () => {
    it("should return the order when fetched successfully with a valid id", async () => {
      const order = buildOrder({ id: "order-abc" });
      mockOrdersService.getById.mockResolvedValueOnce(order);

      const { result } = renderHook(() => useOrder("order-abc"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(order);
      expect(mockOrdersService.getById).toHaveBeenCalledWith("order-abc");
    });

    it("should not fetch when id is an empty string", async () => {
      const { result } = renderHook(() => useOrder(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockOrdersService.getById).not.toHaveBeenCalled();
    });

    it("should return error state when ordersService.getById rejects with 404", async () => {
      const notFoundError = Object.assign(new Error("Not Found"), {
        response: { status: 404 },
      });
      mockOrdersService.getById.mockRejectedValueOnce(notFoundError);

      const { result } = renderHook(() => useOrder("nonexistent-id"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Not Found");
    });

    it("should return an order with DELIVERED status correctly", async () => {
      const order = buildOrder({ id: "order-done", status: "DELIVERED" });
      mockOrdersService.getById.mockResolvedValueOnce(order);

      const { result } = renderHook(() => useOrder("order-done"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe("DELIVERED");
    });

    it("should return an order with CANCELLED status correctly", async () => {
      const order = buildOrder({ id: "order-x", status: "CANCELLED" });
      mockOrdersService.getById.mockResolvedValueOnce(order);

      const { result } = renderHook(() => useOrder("order-x"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe("CANCELLED");
    });

    it("should be in loading state initially before data resolves", async () => {
      let resolvePromise!: (value: Order) => void;
      mockOrdersService.getById.mockReturnValueOnce(
        new Promise<Order>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const { result } = renderHook(() => useOrder("order-1"), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);

      resolvePromise(buildOrder());
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe("useCreateOrder", () => {
    it("should create an order and return the created order on success", async () => {
      const created = buildOrder({ id: "new-order-1" });
      mockOrdersService.create.mockResolvedValueOnce(created);

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("pub-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(created);
      expect(mockOrdersService.create).toHaveBeenCalledWith("pub-1", expect.anything());
    });

    it("should call mutateAsync with a publicationId and resolve with Order", async () => {
      const created = buildOrder({ id: "new-order-2" });
      mockOrdersService.create.mockResolvedValueOnce(created);

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(),
      });

      const order = await result.current.mutateAsync("pub-2");

      expect(order).toEqual(created);
    });

    it("should return error state when ordersService.create rejects", async () => {
      const conflictError = Object.assign(new Error("Conflict"), {
        response: { status: 409 },
      });
      mockOrdersService.create.mockRejectedValueOnce(conflictError);

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("pub-1");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Conflict");
    });

    it("should be in idle state before the mutation is called", () => {
      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(),
      });

      expect(result.current.status).toBe("idle");
      expect(mockOrdersService.create).not.toHaveBeenCalled();
    });

    it("should pass the publicationId correctly as the mutation variable", async () => {
      mockOrdersService.create.mockResolvedValueOnce(buildOrder());

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("publication-uuid-1234");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrdersService.create).toHaveBeenCalledWith("publication-uuid-1234", expect.anything());
    });
  });

  describe("useCancelOrder", () => {
    it("should cancel an order and return the updated order on success", async () => {
      const cancelled = buildOrder({ id: "order-1", status: "CANCELLED" });
      mockOrdersService.cancel.mockResolvedValueOnce(cancelled);

      const { result } = renderHook(() => useCancelOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(cancelled);
      expect(mockOrdersService.cancel).toHaveBeenCalledWith("order-1", expect.anything());
    });

    it("should call mutateAsync with an orderId and resolve with the cancelled Order", async () => {
      const cancelled = buildOrder({ id: "order-2", status: "CANCELLED" });
      mockOrdersService.cancel.mockResolvedValueOnce(cancelled);

      const { result } = renderHook(() => useCancelOrder(), {
        wrapper: createWrapper(),
      });

      const order = await result.current.mutateAsync("order-2");

      expect(order.status).toBe("CANCELLED");
    });

    it("should return error state when ordersService.cancel rejects", async () => {
      mockOrdersService.cancel.mockRejectedValueOnce(new Error("Forbidden"));

      const { result } = renderHook(() => useCancelOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-1");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Forbidden");
    });

    it("should be in idle state before the mutation is called", () => {
      const { result } = renderHook(() => useCancelOrder(), {
        wrapper: createWrapper(),
      });

      expect(result.current.status).toBe("idle");
    });

    it("should pass the orderId correctly to ordersService.cancel", async () => {
      const cancelled = buildOrder({ id: "order-xyz", status: "CANCELLED" });
      mockOrdersService.cancel.mockResolvedValueOnce(cancelled);

      const { result } = renderHook(() => useCancelOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-xyz");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrdersService.cancel).toHaveBeenCalledWith("order-xyz", expect.anything());
    });

    it("should return an updated order with the correct id after cancellation", async () => {
      const cancelled = buildOrder({ id: "order-99", status: "CANCELLED" });
      mockOrdersService.cancel.mockResolvedValueOnce(cancelled);

      const { result } = renderHook(() => useCancelOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-99");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe("order-99");
      expect(result.current.data?.status).toBe("CANCELLED");
    });
  });

  describe("useDeliverOrder", () => {
    it("should deliver an order and return the updated order on success", async () => {
      const delivered = buildOrder({ id: "order-1", status: "DELIVERED" });
      mockOrdersService.deliver.mockResolvedValueOnce(delivered);

      const { result } = renderHook(() => useDeliverOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(delivered);
      expect(mockOrdersService.deliver).toHaveBeenCalledWith("order-1", expect.anything());
    });

    it("should call mutateAsync with an orderId and resolve with the delivered Order", async () => {
      const delivered = buildOrder({ id: "order-3", status: "DELIVERED" });
      mockOrdersService.deliver.mockResolvedValueOnce(delivered);

      const { result } = renderHook(() => useDeliverOrder(), {
        wrapper: createWrapper(),
      });

      const order = await result.current.mutateAsync("order-3");

      expect(order.status).toBe("DELIVERED");
    });

    it("should return error state when ordersService.deliver rejects", async () => {
      mockOrdersService.deliver.mockRejectedValueOnce(new Error("Unprocessable Entity"));

      const { result } = renderHook(() => useDeliverOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-1");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Unprocessable Entity");
    });

    it("should be in idle state before the mutation is called", () => {
      const { result } = renderHook(() => useDeliverOrder(), {
        wrapper: createWrapper(),
      });

      expect(result.current.status).toBe("idle");
      expect(mockOrdersService.deliver).not.toHaveBeenCalled();
    });

    it("should pass the orderId correctly to ordersService.deliver", async () => {
      const delivered = buildOrder({ id: "order-abc", status: "DELIVERED" });
      mockOrdersService.deliver.mockResolvedValueOnce(delivered);

      const { result } = renderHook(() => useDeliverOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-abc");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockOrdersService.deliver).toHaveBeenCalledWith("order-abc", expect.anything());
    });

    it("should return an updated order with DELIVERED status and correct id", async () => {
      const delivered = buildOrder({ id: "order-final", status: "DELIVERED" });
      mockOrdersService.deliver.mockResolvedValueOnce(delivered);

      const { result } = renderHook(() => useDeliverOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("order-final");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe("order-final");
      expect(result.current.data?.status).toBe("DELIVERED");
    });
  });
});
