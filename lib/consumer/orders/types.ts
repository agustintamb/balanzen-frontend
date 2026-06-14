import type { OrderStatus } from "@/api/orders/orders.types";

export type ConsumerOrderFilter = "all" | OrderStatus;
export type DateRangeFilter = "all" | "today" | "week" | "month";
export type OrderSortOption = "recent" | "oldest";
