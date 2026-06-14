import type { FilterOption } from "@/components/FilterChipBar";
import type { MaxRadiusFilter, PubTypeFilter, SortByFilter } from "./types";

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
