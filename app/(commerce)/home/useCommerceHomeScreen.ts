import { useCallback, useEffect, useMemo, useState } from "react";
import type { PublicationStatus } from "@/api/publications/publications.types";
import type { FilterOption } from "@/components/FilterChipBar";
import { useNotifications } from "@/hooks/useNotifications";
import { useOrders } from "@/hooks/useOrders";
import { useMyPublications } from "@/hooks/usePublications";
import { useCurrentUser } from "@/hooks/useUsers";
import { safePush } from "@/utils/navigation";

export type FilterKey = PublicationStatus | "ALL";
export type DateRangeFilter = "all" | "today" | "week" | "month";
export type CommerceSortOption = "recent" | "oldest";

export const FILTERS: FilterOption<FilterKey>[] = [
  { key: "ACTIVE", label: "Activas" },
  { key: "RESERVED", label: "Reservadas" },
  { key: "DELIVERED", label: "Entregadas" },
  { key: "CANCELLED", label: "Canceladas" },
];

export const DATE_FILTERS: FilterOption<DateRangeFilter>[] = [
  { key: "all", label: "Todo" },
  { key: "today", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
];

export const SORT_FILTERS: FilterOption<CommerceSortOption>[] = [
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

  return { date_from: from.toISOString(), date_to: to.toISOString() };
};

export default function _() {
  return null;
}

export const useCommerceHomeScreen = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ACTIVE");
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>("all");
  const [activeSort, setActiveSort] = useState<CommerceSortOption>("recent");
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setActiveSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);
  const [pendingDateFilter, setPendingDateFilter] =
    useState<DateRangeFilter>("all");
  const [pendingSort, setPendingSort] = useState<CommerceSortOption>("recent");

  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();

  const { data: reservedOrders } = useOrders({
    status: "RESERVED",
    limit: 1,
  });

  const { data: activePublicationsData } = useMyPublications({
    status: "ACTIVE",
  });

  const expiringSoonCount = useMemo(() => {
    const pubs = activePublicationsData?.publications ?? [];
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfDayAfterTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 2,
    );
    return pubs.filter((p) => {
      if (!p.expiry_date) return false;
      const expiry = new Date(p.expiry_date);
      return expiry >= startOfToday && expiry < startOfDayAfterTomorrow;
    }).length;
  }, [activePublicationsData]);

  const publicationsParams = useMemo(() => {
    const dateRange = getDateRange(dateFilter);
    // CANCELLED fetches without status filter so EXPIRED publications are included too
    const statusParam =
      activeFilter !== "ALL" && activeFilter !== "CANCELLED"
        ? { status: activeFilter }
        : {};
    return { ...statusParam, ...dateRange };
  }, [activeFilter, dateFilter]);

  const {
    data: publicationsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyPublications(
    Object.keys(publicationsParams).length ? publicationsParams : undefined,
  );

  const sortedPublications = useMemo(() => {
    const pubs = publicationsData?.publications ?? [];
    if (activeSort === "oldest") {
      return [...pubs].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }
    return [...pubs].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [publicationsData, activeSort]);

  const statusFilteredPublications = useMemo(() => {
    if (activeFilter !== "CANCELLED") return sortedPublications;
    return sortedPublications.filter(
      (p) => p.status === "CANCELLED" || p.status === "EXPIRED",
    );
  }, [sortedPublications, activeFilter]);

  const filteredPublications = useMemo(() => {
    if (!activeSearch) return statusFilteredPublications;
    const q = activeSearch.toLowerCase();
    return statusFilteredPublications.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [statusFilteredPublications, activeSearch]);

  const businessName =
    user?.business_name ??
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  const hasActiveFilters = dateFilter !== "all" || activeSort !== "recent";

  const handleBell = useCallback(() => safePush("/notifications"), []);
  const handleFilterChange = useCallback(
    (key: FilterKey) => setActiveFilter(key),
    [],
  );
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
  const handleRefetch = useCallback(() => refetch(), [refetch]);

  return {
    businessName,
    unreadCount: notifications?.unread_count ?? 0,
    activeReservations: reservedOrders?.pagination.total ?? 0,
    expiringSoonCount,
    publications: filteredPublications,
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
    handleRefetch,
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
