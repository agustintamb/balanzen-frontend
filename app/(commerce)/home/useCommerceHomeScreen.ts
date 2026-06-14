import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useNotifications } from "@/hooks/useNotifications";
import { useOrders } from "@/hooks/useOrders";
import { useMyPublications } from "@/hooks/usePublications";
import { useCurrentUser } from "@/hooks/useUsers";
import {
  DATE_FILTERS,
  FILTERS,
  SORT_FILTERS,
} from "@/lib/commerce/home/constants";
import type {
  CommerceSortOption,
  DateRangeFilter,
  FilterKey,
} from "@/lib/commerce/home/types";
import { getDateRange } from "@/utils/dateFilters";
import { safePush } from "@/utils/navigation";
import {
  countExpiringPublications,
  filterPublications,
  searchPublications,
  sortPublications,
} from "@/utils/publications";

export type { CommerceSortOption, DateRangeFilter, FilterKey };
export { FILTERS, DATE_FILTERS, SORT_FILTERS };

export default function _() {
  return null;
}

export const useCommerceHomeScreen = () => {
  // ─── State ────────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ACTIVE");
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all");
  const [activeSort, setActiveSort] = useState<CommerceSortOption>("recent");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [pendingDateFilter, setPendingDateFilter] =
    useState<DateRangeFilter>("all");
  const [pendingSort, setPendingSort] = useState<CommerceSortOption>("recent");

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleBell = () => safePush("/notifications");
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

  const handleResetFilters = useCallback(() => {
    setDateFilter("all");
    setActiveSort("recent");
    setPendingDateFilter("all");
    setPendingSort("recent");
    setIsFilterSheetVisible(false);
  }, []);

  // ─── Effects ──────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      setActiveFilter("ACTIVE");
      setDateFilter("all");
      setActiveSort("recent");
      setSearch("");
      setActiveSearch("");
      setIsFilterSheetVisible(false);
      setPendingDateFilter("all");
      setPendingSort("recent");
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(() => setActiveSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();

  const { data: reservedOrders } = useOrders({
    status: "RESERVED",
    limit: 1,
  });

  const { data: activePublicationsData } = useMyPublications({
    status: "ACTIVE",
  });

  const params = {
    ...(activeFilter !== "ALL" && activeFilter !== "CANCELLED"
      ? { status: activeFilter }
      : {}),
    ...getDateRange(dateFilter),
  };

  const {
    data: publicationsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyPublications(Object.keys(params).length ? params : undefined);

  // ─── Derived data ─────────────────────────────────────────────────────────
  const pubs = publicationsData?.publications ?? [];
  const sorted = sortPublications(pubs, activeSort);
  const filtered = filterPublications(sorted, activeFilter);
  const searched = searchPublications(filtered, activeSearch);

  const businessName =
    user?.business_name ??
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  const hasActiveFilters = dateFilter !== "all" || activeSort !== "recent";

  return {
    businessName,
    unreadCount: notifications?.unread_count ?? 0,
    activeReservations: reservedOrders?.pagination.total ?? 0,
    expiringSoonCount: countExpiringPublications(
      activePublicationsData?.publications,
    ),
    publications: searched,
    search,
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
    handleRefetch: refetch,
    handleBell,
    handleFilterChange,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingDateChange: setPendingDateFilter,
    handlePendingSortChange: setPendingSort,
    onSearchChange: setSearch,
  };
};
