import type { PublicationStatus } from "@/api/publications/publications.types";

export type FilterKey = PublicationStatus | "ALL";
export type DateRangeFilter = "all" | "today" | "week" | "month";
export type CommerceSortOption = "recent" | "oldest";
