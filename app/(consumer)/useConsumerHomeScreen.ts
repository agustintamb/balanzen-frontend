import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterOption } from "@/components/ui/FilterChipBar";
import { useCategories } from "@/hooks/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { usePublications } from "@/hooks/usePublications";
import { useCurrentUser } from "@/hooks/useUsers";
import { safePush } from "@/utils/navigation";

export type CategoryFilterKey = "all" | (string & {});
export type PubTypeFilter = "all" | "discount" | "donation";
export type MaxRadiusFilter = "any" | "3" | "10" | "15";
export type SortByFilter =
  | "created_at"
  | "discount_pct"
  | "expiry_date"
  | "distance";

export const PUB_TYPE_FILTERS: FilterOption<PubTypeFilter>[] = [
  { key: "all", label: "Todo" },
  { key: "discount", label: "Descuento" },
  { key: "donation", label: "Donación" },
];

export const MAX_RADIUS_FILTERS: FilterOption<MaxRadiusFilter>[] = [
  { key: "any", label: "Cualquiera" },
  { key: "3", label: "< 3 km" },
  { key: "10", label: "< 10 km" },
  { key: "15", label: "< 15 km" },
];

export const SORT_FILTERS: FilterOption<SortByFilter>[] = [
  { key: "distance", label: "Cercanía" },
  { key: "discount_pct", label: "Descuento" },
  { key: "expiry_date", label: "Vencimiento" },
];

const SORT_ORDER_MAP: Record<SortByFilter, "asc" | "desc"> = {
  created_at: "desc",
  discount_pct: "desc",
  expiry_date: "asc",
  distance: "asc",
};

export default function _() {
  return null;
}

export const useConsumerHomeScreen = () => {
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilterKey>("all");
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);

  const [activePubType, setActivePubType] = useState<PubTypeFilter>("all");
  const [activeMaxRadius, setActiveMaxRadius] =
    useState<MaxRadiusFilter>("any");
  const [activeSortBy, setActiveSortBy] = useState<SortByFilter>("distance");

  const [pendingPubType, setPendingPubType] = useState<PubTypeFilter>("all");
  const [pendingMaxRadius, setPendingMaxRadius] =
    useState<MaxRadiusFilter>("any");
  const [pendingSortBy, setPendingSortBy] = useState<SortByFilter>("distance");

  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();
  const { data: categories } = useCategories();

  useEffect(() => {
    const timer = setTimeout(() => setActiveSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const lat = user?.selected_address?.lat;
  const lng = user?.selected_address?.lng;
  const hasLatLng = lat != null && lng != null;

  const effectiveSortBy =
    activeSortBy === "distance" && !hasLatLng ? "created_at" : activeSortBy;

  const filters = useMemo(
    () => ({
      ...(activeSearch ? { search: activeSearch } : {}),
      ...(selectedCategory !== "all" ? { category_id: selectedCategory } : {}),
      ...(activePubType === "donation" ? { donation: true } : {}),
      ...(activePubType === "discount" ? { min_discount: 1 } : {}),
      ...(activeMaxRadius !== "any" && hasLatLng
        ? { radius_km: parseInt(activeMaxRadius) }
        : {}),
      ...(hasLatLng ? { lat, lng } : {}),
      sort_by: effectiveSortBy,
      sort_order: SORT_ORDER_MAP[effectiveSortBy],
    }),
    [
      activeSearch,
      selectedCategory,
      activePubType,
      activeMaxRadius,
      effectiveSortBy,
      hasLatLng,
      lat,
      lng,
    ],
  );

  const {
    data: publicationsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePublications(filters);

  const categoryFilters: FilterOption<CategoryFilterKey>[] = useMemo(
    () => [
      { key: "all", label: "Todas" },
      ...(categories ?? [])
        .slice()
        .sort((a, b) => {
          const aOtros = a.name.toLowerCase() === "otros";
          const bOtros = b.name.toLowerCase() === "otros";
          if (aOtros) return 1;
          if (bOtros) return -1;
          return 0;
        })
        .map((cat) => ({ key: cat.id, label: cat.name })),
    ],
    [categories],
  );

  const hasActiveFilters =
    activePubType !== "all" ||
    activeMaxRadius !== "any" ||
    activeSortBy !== "distance";

  const handleBell = useCallback(() => safePush("/notifications"), []);
  const handleRefetch = useCallback(() => refetch(), [refetch]);
  const handleCategoryChange = useCallback(
    (key: CategoryFilterKey) => setSelectedCategory(key),
    [],
  );

  const handleOpenFilterSheet = useCallback(() => {
    setPendingPubType(activePubType);
    setPendingMaxRadius(activeMaxRadius);
    setPendingSortBy(activeSortBy);
    setIsFilterSheetVisible(true);
  }, [activePubType, activeMaxRadius, activeSortBy]);

  const handleCloseFilterSheet = useCallback(
    () => setIsFilterSheetVisible(false),
    [],
  );

  const handleApplyFilters = useCallback(() => {
    setActivePubType(pendingPubType);
    setActiveMaxRadius(pendingMaxRadius);
    setActiveSortBy(pendingSortBy);
    setIsFilterSheetVisible(false);
  }, [pendingPubType, pendingMaxRadius, pendingSortBy]);

  const handleResetFilters = useCallback(() => {
    setActivePubType("all");
    setActiveMaxRadius("any");
    setActiveSortBy("distance");
    setPendingPubType("all");
    setPendingMaxRadius("any");
    setPendingSortBy("distance");
    setIsFilterSheetVisible(false);
  }, []);

  return {
    firstName: user?.first_name ?? "",
    selectedAddress: user?.selected_address?.formatted_address ?? null,
    unreadCount: notifications?.unread_count ?? 0,
    categoryFilters,
    publications: publicationsData?.publications ?? [],
    selectedCategory,
    search,
    isLoading,
    isError,
    isRefetching,
    hasLatLng,
    hasActiveFilters,
    isFilterSheetVisible,
    pendingPubType,
    pendingMaxRadius,
    pendingSortBy,
    onSearchChange: setSearch,
    handleCategoryChange,
    handleBell,
    handleRefetch,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingPubTypeChange: setPendingPubType,
    handlePendingMaxRadiusChange: setPendingMaxRadius,
    handlePendingSortByChange: setPendingSortBy,
  };
};
