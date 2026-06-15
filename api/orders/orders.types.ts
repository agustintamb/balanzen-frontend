import { AddressInput } from "@/api/addresses/addresses.types";
import { Publication } from "@/api/publications/publications.types";
import { Pagination, PaginationParams } from "@/api/shared.types";

export type OrderStatus = "RESERVED" | "DELIVERED" | "CANCELLED";

/** Publicación resumida que embeben el listado (`GET /orders`) y `POST /orders`. */
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
  /** Avatar del consumidor. Presente en el detalle (`GET /orders/{id}`); puede ser null. */
  photo_url?: string | null;
  /** Teléfono del consumidor. Opcional: el backend aún no siempre lo expone. */
  phone?: string | null;
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

/**
 * Detalle de una orden (`GET /orders/{id}`). A diferencia de `Order`, embebe la
 * publicación **completa** (misma forma que `GET /publications/{id}`) y el
 * consumidor con `photo_url`. El backend la resuelve con `findWithDeleted`, así
 * que sigue disponible aunque la publicación haya sido soft-deleteada.
 */
export interface OrderDetail {
  id: string;
  publication: Publication;
  consumer: OrderConsumer;
  commerce: OrderCommerce;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
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
