import { AddressInput, AddressSummary } from "@/api/addresses/addresses.types";

export type UserRole = "CONSUMIDOR" | "COMERCIO";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string;
  dni: string;
  photo_url: string | null;
  has_address: boolean;
  selected_address: AddressSummary | null;
  // COMERCIO only
  business_name?: string;
  cuit?: string;
  description?: string | null;
  created_at: string;
}

export interface PublicUserCommerce {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  business_name: string;
  selected_address: Pick<AddressInput, "formatted_address" | "lat" | "lng">;
}

export interface PublicUserConsumer {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

export type PublicUser = PublicUserCommerce | PublicUserConsumer;

export interface UpdateProfileBody {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  photo_url?: string | null;
  // COMERCIO only
  business_name?: string;
  description?: string | null;
}
