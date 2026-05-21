import { Pagination, PaginationParams } from "@/api/shared.types";

export type NotificationType =
  | "NEW_RESERVATION"
  | "RESERVATION_CANCELLED_BY_CONSUMER"
  | "RESERVATION_CANCELLED_BY_COMMERCE"
  | "ORDER_DELIVERED"
  | "NEW_MESSAGE"
  | "PUBLICATION_EXPIRING"
  | "PUBLICATION_EXPIRED";

export type ReferenceType = "PUBLICATION" | "ORDER";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  reference_id: string;
  reference_type: ReferenceType;
  read: boolean;
  created_at: string;
}

export interface NotificationFilters extends PaginationParams {
  read?: boolean;
}

export interface NotificationListResponse {
  unread_count: number;
  notifications: Notification[];
  pagination: Pagination;
}
