import { AddressInput } from "@/api/addresses/addresses.types";
import { Pagination, PaginationParams } from "@/api/shared.types";

export type OrderStatus = "RESERVED" | "DELIVERED" | "CANCELLED";

export interface OrderPublication {
  id: string;
  title: string;
  final_price: number;
  photos: string[];
}

export interface OrderCommerce {
  id: string;
  business_name: string;
  selected_address: Pick<AddressInput, "formatted_address">;
}

export interface OrderConsumer {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Order {
  id: string;
  publication: OrderPublication;
  consumer: OrderConsumer;
  commerce: OrderCommerce;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  unread_count: number;
}

export interface OrderFilters extends PaginationParams {
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
}
