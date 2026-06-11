import { AddressInput } from "@/api/addresses/addresses.types";
import { Category } from "@/api/categories/categories.types";
import { Pagination, PaginationParams } from "@/api/shared.types";

export type PublicationStatus =
  | "ACTIVE"
  | "RESERVED"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";

export interface PublicationCommerce {
  id: string;
  business_name: string;
  selected_address: Pick<AddressInput, "formatted_address" | "lat" | "lng">;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  original_price: number;
  final_price: number;
  discount_pct: number;
  expiry_date: string;
  category: Category;
  photos: string[];
  status: PublicationStatus;
  is_donation: boolean;
  commerce: PublicationCommerce;
  distance_km?: number;
  created_at: string;
}

export interface PublicationFilters extends PaginationParams {
  category_id?: string;
  min_discount?: number;
  max_price?: number;
  sort_by?:
    | "created_at"
    | "discount_pct"
    | "expiry_date"
    | "final_price"
    | "distance";
  sort_order?: "asc" | "desc";
  lat?: number;
  lng?: number;
  radius_km?: number;
  donation?: boolean;
  search?: string;
}

export interface MyPublicationsFilters extends PaginationParams {
  status?: PublicationStatus;
}

export interface CreatePublicationBody {
  title: string;
  description: string;
  original_price: number;
  final_price: number;
  expiry_date: string;
  category_id: string;
  photos: string[];
}

export type UpdatePublicationBody = Partial<CreatePublicationBody>;

export interface PublicationListResponse {
  publications: Publication[];
  pagination: Pagination;
}
