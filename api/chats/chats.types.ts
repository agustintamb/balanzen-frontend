import { OrderStatus } from "@/api/orders/orders.types";
import { Pagination, PaginationParams } from "@/api/shared.types";

export interface Message {
  id: string;
  order_id?: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatCounterpart {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  business_name?: string;
}

export interface Chat {
  order_id: string;
  counterpart: ChatCounterpart;
  publication_title: string;
  last_message: {
    content: string;
    sender_id: string;
    created_at: string;
  } | null;
  unread_count: number;
  order_status: OrderStatus;
}

export interface ChatListResponse {
  chats: Chat[];
}

export interface MessageListResponse {
  messages: Message[];
  pagination: Pagination;
}

export type ChatMessagesParams = PaginationParams;
