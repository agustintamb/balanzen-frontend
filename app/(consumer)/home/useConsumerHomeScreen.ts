import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCategories } from "@/hooks/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { usePublications } from "@/hooks/usePublications";
import { useCurrentUser } from "@/hooks/useUsers";
import {
  MAX_RADIUS_FILTERS,
  PUB_TYPE_FILTERS,
  SORT_FILTERS,
} from "@/lib/consumer/home/constants";
import type {
  CategoryFilterKey,
  MaxRadiusFilter,
  PubTypeFilter,
  SortByFilter,
} from "@/lib/consumer/home/types";
import {
  buildCategoryFilters,
  buildPublicationFilters,
} from "@/lib/consumer/home/utils";
import { safePush } from "@/utils/navigation";

export type { CategoryFilterKey, MaxRadiusFilter, PubTypeFilter, SortByFilter };
export { MAX_RADIUS_FILTERS, PUB_TYPE_FILTERS, SORT_FILTERS };

export default function _() {
  return null;
}

export const useConsumerHomeScreen = () => {
  // ─── State ────────────────────────────────────────────────────────────────
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

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleCategoryChange = setSelectedCategory;
  const handleBell = () => safePush("/notifications");

  const handleOpenFilterSheet = () => {
    setPendingPubType(activePubType);
    setPendingMaxRadius(activeMaxRadius);
    setPendingSortBy(activeSortBy);
    setIsFilterSheetVisible(true);
  };

  const handleCloseFilterSheet = () => setIsFilterSheetVisible(false);

  const handleApplyFilters = () => {
    setActivePubType(pendingPubType);
    setActiveMaxRadius(pendingMaxRadius);
    setActiveSortBy(pendingSortBy);
    setIsFilterSheetVisible(false);
  };

  const handleResetFilters = useCallback(() => {
    setActivePubType("all");
    setActiveMaxRadius("any");
    setActiveSortBy("distance");
    setPendingPubType("all");
    setPendingMaxRadius("any");
    setPendingSortBy("distance");
    setIsFilterSheetVisible(false);
  }, []);

  // ─── Effects ──────────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      setSearch("");
      setActiveSearch("");
      setSelectedCategory("all");
      setIsFilterSheetVisible(false);
      setActivePubType("all");
      setActiveMaxRadius("any");
      setActiveSortBy("distance");
      setPendingPubType("all");
      setPendingMaxRadius("any");
      setPendingSortBy("distance");
    }, []),
  );

  useEffect(() => {
    const timer = setTimeout(() => setActiveSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Queries ──────────────────────────────────────────────────────────────
  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();
  const { data: categories } = useCategories();

  // ─── Derived data ─────────────────────────────────────────────────────────
  const lat = user?.selected_address?.lat;
  const lng = user?.selected_address?.lng;
  const hasLatLng = lat != null && lng != null;

  const categoryFilters = buildCategoryFilters(categories);

  const filters = buildPublicationFilters(
    activeSearch,
    selectedCategory,
    activePubType,
    activeMaxRadius,
    activeSortBy,
    hasLatLng,
    lat,
    lng,
  );

  const {
    data: publicationsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePublications(filters);

  const hasActiveFilters =
    activePubType !== "all" ||
    activeMaxRadius !== "any" ||
    activeSortBy !== "distance";

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
    handleRefetch: refetch,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingPubTypeChange: setPendingPubType,
    handlePendingMaxRadiusChange: setPendingMaxRadius,
    handlePendingSortByChange: setPendingSortBy,
  };
};
