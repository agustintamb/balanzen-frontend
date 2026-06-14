import type { OrderStatus } from "@/api/orders/orders.types";
import type { ChipProps } from "@/components/ui/Chip";
import { formatRelativeDate } from "@/utils/format";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RESERVED: "Reservado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_CHIP_VARIANT: Record<
  OrderStatus,
  ChipProps["variant"]
> = {
  RESERVED: "warning",
  DELIVERED: "info",
  CANCELLED: "error",
};

export const formatPrice = (price: number): string =>
  `$${price.toLocaleString("es-AR")}`;

export const getOrderDateLabel = (
  status: OrderStatus,
  created_at: string,
  updated_at: string | undefined,
): string => {
  const resolvedDate = updated_at ?? created_at;
  if (status === "DELIVERED")
    return `Entregado ${formatRelativeDate(resolvedDate)}`;
  if (status === "CANCELLED")
    return `Cancelado ${formatRelativeDate(resolvedDate)}`;
  return `Pedido ${formatRelativeDate(created_at)}`;
};
