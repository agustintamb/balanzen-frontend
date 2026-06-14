import type { FilterOption } from "@/components/FilterChipBar";
import type {
  ConsumerOrderFilter,
  DateRangeFilter,
  OrderSortOption,
} from "./types";

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
