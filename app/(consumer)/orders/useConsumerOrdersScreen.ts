import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useOrders } from "@/hooks/useOrders";
import type {
  ConsumerOrderFilter,
  DateRangeFilter,
  OrderSortOption,
} from "@/lib/consumer/orders/types";
import {
  buildOrderFilterParams,
  sortAndSearchOrders,
} from "@/lib/consumer/orders/utils";

export type { ConsumerOrderFilter, DateRangeFilter, OrderSortOption };
export {
  DATE_FILTERS,
  FILTERS,
  SORT_FILTERS,
} from "@/lib/consumer/orders/constants";

export default function _() {
  return null;
}

export const useConsumerOrdersScreen = () => {
  // ─── State ────────────────────────────────────────────────────────────────
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

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleFilterChange = setActiveFilter;

  const handleOpenFilterSheet = () => {
    setPendingDateFilter(dateFilter);
    setPendingSort(activeSort);
    setIsFilterSheetVisible(true);
  };

  const handleCloseFilterSheet = () => setIsFilterSheetVisible(false);

  const handleApplyFilters = () => {
    setDateFilter(pendingDateFilter);
    setActiveSort(pendingSort);
    setIsFilterSheetVisible(false);
  };

  const handleResetFilters = () => {
    setDateFilter("all");
    setActiveSort("recent");
    setPendingDateFilter("all");
    setPendingSort("recent");
    setIsFilterSheetVisible(false);
  };

  // ─── Effects ──────────────────────────────────────────────────────────────
  // Al volver a la pantalla, resetear filtros/búsqueda a sus valores por
  // defecto (mismo comportamiento que el home).
  useFocusEffect(
    useCallback(() => {
      setActiveFilter("RESERVED");
      setDateFilter("all");
      setActiveSort("recent");
      setIsFilterSheetVisible(false);
      setPendingDateFilter("all");
      setPendingSort("recent");
      setSearch("");
      setActiveSearch("");
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(() => setActiveSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Queries ──────────────────────────────────────────────────────────────
  const params = buildOrderFilterParams(activeFilter, dateFilter);

  const {
    data: ordersData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useOrders(Object.keys(params).length ? params : undefined);

  // ─── Derived data ─────────────────────────────────────────────────────────
  const sortedOrders = sortAndSearchOrders(
    ordersData?.orders,
    activeSort,
    activeSearch,
  );

  const hasActiveFilters = dateFilter !== "all" || activeSort !== "recent";

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
    handleFilterChange,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingDateChange: setPendingDateFilter,
    handlePendingSortChange: setPendingSort,
    handleRefetch: refetch,
  };
};
