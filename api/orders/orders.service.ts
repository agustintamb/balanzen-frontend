import apiClient from "@/api/client";
import {
  Order,
  OrderDetail,
  OrderFilters,
  OrderListResponse,
} from "@/api/orders/orders.types";

export const ordersService = {
  create: (publicationId: string): Promise<Order> =>
    apiClient.post("/orders", { publication_id: publicationId }),

  list: (params?: OrderFilters): Promise<OrderListResponse> =>
    apiClient.get("/orders", { params }),

  getById: (id: string): Promise<OrderDetail> => apiClient.get(`/orders/${id}`),

  cancel: (id: string): Promise<Order> => apiClient.put(`/orders/${id}/cancel`),

  deliver: (id: string): Promise<Order> =>
    apiClient.put(`/orders/${id}/deliver`),
};
