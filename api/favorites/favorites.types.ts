import { AddressInput } from "@/api/addresses/addresses.types";
import { PublicationStatus } from "@/api/publications/publications.types";
import { Pagination, PaginationParams } from "@/api/shared.types";

export interface FavoritePublication {
  id: string;
  title: string;
  original_price: number;
  final_price: number;
  discount_pct: number;
  photos: string[];
  status: PublicationStatus;
  is_donation?: boolean;
  expiry_date?: string;
  commerce: {
    business_name: string;
    selected_address: Pick<AddressInput, "formatted_address">;
  };
}

export interface Favorite {
  id: string;
  publication: FavoritePublication;
  created_at: string;
}

export interface FavoriteListResponse {
  favorites: Favorite[];
  pagination: Pagination;
}

export interface FavoritesParams extends PaginationParams {}
