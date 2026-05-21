import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ordersService } from "@/api/orders/orders.service";
import { Order, OrderFilters, OrderListResponse } from "@/api/orders/orders.types";

export const useOrders = (params?: OrderFilters) =>
  useQuery<OrderListResponse, Error>({
    queryKey: ["orders", params],
    queryFn: () => ordersService.list(params),
    staleTime: 1000 * 60,
  });

export const useOrder = (id: string) =>
  useQuery<Order, Error>({
    queryKey: ["orders", id],
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, string>({
    mutationFn: ordersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, string>({
    mutationFn: ordersService.cancel,
    onSuccess: (updated) => {
      queryClient.setQueryData(["orders", updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
};

export const useDeliverOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, string>({
    mutationFn: ordersService.deliver,
    onSuccess: (updated) => {
      queryClient.setQueryData(["orders", updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
