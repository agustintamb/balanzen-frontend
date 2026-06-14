import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrderStatus } from "@/api/orders/orders.types";
import type { FilterOption } from "@/components/FilterChipBar";
import { useOrders } from "@/hooks/useOrders";

export type ConsumerOrderFilter = "all" | OrderStatus;
export type DateRangeFilter = "all" | "today" | "week" | "month";
export type OrderSortOption = "recent" | "oldest";

export const FILTERS: FilterOption<ConsumerOrderFilter>[] = [
  { key: "RESERVED", label: "Activos" },
  { key: "DELIVERED", label: "Entregados" },
  { key: "CANCELLED", label: "Cancelados" },
  { key: "all", label: "Todos" },
];

export const DATE_FILTERS: FilterOption<DateRangeFilter>[] = [
  { key: "all", label: "Todo" },
  { key: "today", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
];

export const SORT_FILTERS: FilterOption<OrderSortOption>[] = [
  { key: "recent", label: "Más recientes" },
  { key: "oldest", label: "Más antiguos" },
];

const getDateRange = (
  filter: DateRangeFilter,
): { date_from?: string; date_to?: string } => {
  if (filter === "all") return {};

  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  if (filter === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (filter === "week") {
    const day = from.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday as week start
    from.setDate(from.getDate() + diff);
    from.setHours(0, 0, 0, 0);
  } else {
    // month
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
  }

  // date_from is always <= date_to by construction
  return { date_from: from.toISOString(), date_to: to.toISOString() };
};

export default function _() {
  return null;
}

export const useConsumerOrdersScreen = () => {
  const [activeFilter, setActiveFilter] =
    useState<ConsumerOrderFilter>("RESERVED");
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all");
  const [activeSort, setActiveSort] = useState<OrderSortOption>("recent");
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [pendingDateFilter, setPendingDateFilter] =
    useState<DateRangeFilter>("all");
  const [pendingSort, setPendingSort] = useState<OrderSortOption>("recent");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setActiveSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo(() => {
    const dateRange = getDateRange(dateFilter);
    return {
      ...(activeFilter !== "all" ? { status: activeFilter } : {}),
      ...dateRange,
    };
  }, [activeFilter, dateFilter]);

  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useOrders(Object.keys(params).length ? params : undefined);

  const sortedOrders = useMemo(() => {
    const orders = ordersData?.orders ?? [];
    const filtered = activeSearch
      ? orders.filter((o) =>
          o.publication.title
            .toLowerCase()
            .includes(activeSearch.toLowerCase()),
        )
      : orders;
    if (activeSort === "oldest") {
      return [...filtered].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }
    return [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [ordersData, activeSort, activeSearch]);

  const hasActiveFilters = dateFilter !== "all" || activeSort !== "recent";

  const handleOpenFilterSheet = useCallback(() => {
    setPendingDateFilter(dateFilter);
    setPendingSort(activeSort);
    setIsFilterSheetVisible(true);
  }, [dateFilter, activeSort]);
  const handleCloseFilterSheet = useCallback(
    () => setIsFilterSheetVisible(false),
    [],
  );
  const handleApplyFilters = useCallback(() => {
    setDateFilter(pendingDateFilter);
    setActiveSort(pendingSort);
    setIsFilterSheetVisible(false);
  }, [pendingDateFilter, pendingSort]);
  const handleResetFilters = useCallback(() => {
    setDateFilter("all");
    setActiveSort("recent");
    setPendingDateFilter("all");
    setPendingSort("recent");
    setIsFilterSheetVisible(false);
  }, []);

  return {
    orders: sortedOrders,
    isLoading,
    isError,
    isRefetching,
    activeFilter,
    dateFilter,
    activeSort,
    hasActiveFilters,
    isFilterSheetVisible,
    pendingDateFilter,
    pendingSort,
    search,
    onSearchChange: setSearch,
    handleFilterChange: setActiveFilter,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingDateChange: setPendingDateFilter,
    handlePendingSortChange: setPendingSort,
    handleRefetch: refetch,
  };
};
