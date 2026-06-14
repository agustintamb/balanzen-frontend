import type { FilterOption } from "@/components/FilterChipBar";
import type { CommerceSortOption, DateRangeFilter, FilterKey } from "./types";

export const FILTERS: FilterOption<FilterKey>[] = [
  { key: "ACTIVE", label: "Activas" },
  { key: "RESERVED", label: "Reservadas" },
  { key: "DELIVERED", label: "Entregadas" },
  { key: "CANCELLED", label: "Canceladas" },
  { key: "ALL", label: "Todas" },
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
