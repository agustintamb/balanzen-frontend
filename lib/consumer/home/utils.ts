import type { Category } from "@/api/categories/categories.types";
import type { FilterOption } from "@/components/FilterChipBar";
import type {
  CategoryFilterKey,
  MaxRadiusFilter,
  PubTypeFilter,
  SortByFilter,
} from "./types";

const SORT_ORDER_MAP: Record<SortByFilter, "asc" | "desc"> = {
  created_at: "desc",
  discount_pct: "desc",
  expiry_date: "asc",
  distance: "asc",
};

export const buildCategoryFilters = (
  categories: Category[] | undefined,
): FilterOption<CategoryFilterKey>[] => {
  if (!categories) {
    return [{ key: "all", label: "Todas" }];
  }

  return [
    { key: "all", label: "Todas" },
    ...categories
      .slice()
      .sort((a, b) => {
        const aOtros = a.name.toLowerCase() === "otros";
        const bOtros = b.name.toLowerCase() === "otros";
        if (aOtros) return 1;
        if (bOtros) return -1;
        return 0;
      })
      .map((cat) => ({ key: cat.id, label: cat.name })),
  ];
};

export interface PublicationFiltersArgs {
  activeSearch: string;
  selectedCategory: CategoryFilterKey;
  activePubType: PubTypeFilter;
  activeMaxRadius: MaxRadiusFilter;
  activeSortBy: SortByFilter;
  hasLatLng: boolean;
  lat: number | null | undefined;
  lng: number | null | undefined;
}

export const buildPublicationFilters = ({
  activeSearch,
  selectedCategory,
  activePubType,
  activeMaxRadius,
  activeSortBy,
  hasLatLng,
  lat,
  lng,
}: PublicationFiltersArgs) => {
  const effectiveSortBy =
    activeSortBy === "distance" && !hasLatLng ? "created_at" : activeSortBy;

  return {
    ...(activeSearch ? { search: activeSearch } : {}),
    ...(selectedCategory === "all" ? {} : { category_id: selectedCategory }),
    ...(activePubType === "donation" ? { donation: true } : {}),
    ...(activePubType === "discount" ? { min_discount: 1 } : {}),
    ...(activeMaxRadius !== "any" && hasLatLng
      ? { radius_km: Number.parseInt(activeMaxRadius, 10) }
      : {}),
    ...(hasLatLng && lat != null && lng != null ? { lat, lng } : {}),
    sort_by: effectiveSortBy,
    sort_order: SORT_ORDER_MAP[effectiveSortBy],
  };
};
