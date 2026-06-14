import type { Order } from "@/api/orders/orders.types";
import { getDateRange } from "@/utils/dateFilters";
import { sortAndSearchOrders as globalSortAndSearchOrders } from "@/utils/orders";
import type { ConsumerOrderFilter, DateRangeFilter } from "./types";

export const buildOrderFilterParams = (
  activeFilter: ConsumerOrderFilter,
  dateFilter: DateRangeFilter,
) => {
  const dateRange = getDateRange(dateFilter);
  return {
    ...(activeFilter !== "all" ? { status: activeFilter } : {}),
    ...dateRange,
  };
};

export const sortAndSearchOrders = (
  orders: Order[] | undefined,
  activeSort: "recent" | "oldest",
  activeSearch: string,
): Order[] => {
  return globalSortAndSearchOrders(orders, activeSort, activeSearch);
};
