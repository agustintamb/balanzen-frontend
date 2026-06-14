export type CategoryFilterKey = "all" | (string & {});
export type PubTypeFilter = "all" | "discount" | "donation";
export type MaxRadiusFilter = "any" | "3" | "10" | "15";
export type SortByFilter =
  | "created_at"
  | "discount_pct"
  | "expiry_date"
  | "distance";
