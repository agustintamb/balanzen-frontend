import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { OrderStatus } from "@/api/orders/orders.types";
import type { StatusNotice } from "@/components/ProductDetail/StatusNoticeBanner";
import {
  buildCommerceInfoItems,
  buildFullName,
  getInitials,
  sharePublication,
  type InfoItem,
} from "@/components/ProductDetail/utils";
import { useChats } from "@/hooks/useChats";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { useCancelOrder, useDeliverOrder, useOrder } from "@/hooks/useOrders";
import { useSocketEvent } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";

export interface OrderCounterpart {
  title: string;
  subtitle?: string;
  initials?: string;
  avatarUrl?: string | null;
  chatEnabled: boolean;
}

export type OrderFooterKind = "consumer-cancel" | "commerce-actions" | "none";

const buildStatusNotice = (
  status: OrderStatus | undefined,
  isCommerce: boolean,
): StatusNotice | null => {
  if (status === "DELIVERED") {
    return {
      icon: "check-circle",
      tone: "success",
      text: isCommerce
        ? "Pedido entregado."
        : "Tu pedido fue entregado. ¡Gracias por usar BalanZen!",
    };
  }
  if (status === "CANCELLED" && !isCommerce) {
    return {
      icon: "x-circle",
      tone: "error",
      text: "Esta reserva fue cancelada.",
    };
  }
  return null;
};

export const useOrderDetailScreen = () => {
  const router = useRouter();
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { showSuccess } = useToast();

  const {
    data: order,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useOrder(id);
  const publication = order?.publication;
  const { data: chats } = useChats();
  const { isFavorite, toggleFavorite } = useFavoriteToggle(publication?.id);
  const { mutateAsync: cancelOrder, isPending: isCancelling } =
    useCancelOrder();
  const { mutateAsync: deliverOrder, isPending: isDelivering } =
    useDeliverOrder();

  const [cancelVisible, setCancelVisible] = useState(false);
  const [deliverVisible, setDeliverVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [liveUnread, setLiveUnread] = useState(false);
  const [chatVisited, setChatVisited] = useState(false);

  const isCommerce = user?.role === "COMERCIO";
  const isReserved = order?.status === "RESERVED";

  const orderUnreadCount =
    chats?.find((c) => c.order_id === id)?.unread_count ?? 0;
  const hasUnreadChat = !chatVisited && (liveUnread || orderUnreadCount > 0);

  useSocketEvent<{ type?: string; reference_id?: string }>(
    "new_notification",
    (payload) => {
      if (payload?.type === "NEW_MESSAGE" && payload.reference_id === id) {
        setLiveUnread(true);
        setChatVisited(false);
      }
    },
  );

  useEffect(() => {
    if (isCommerce && order?.status === "CANCELLED" && publication?.id) {
      showSuccess("La reserva fue cancelada por el cliente");
      router.replace(`/publication/${publication.id}`);
    }
  }, [isCommerce, order?.status, publication?.id, router, showSuccess]);

  const statusNotice = buildStatusNotice(order?.status, isCommerce);

  let footerKind: OrderFooterKind = "none";
  if (isReserved && isCommerce) footerKind = "commerce-actions";
  else if (isReserved && !isCommerce) footerKind = "consumer-cancel";

  const counterpart: OrderCounterpart | null = (() => {
    if (!order) return null;
    if (isCommerce) {
      const name = buildFullName(
        order.consumer.first_name,
        order.consumer.last_name,
      );
      return {
        title: name,
        initials: getInitials(name),
        avatarUrl: order.consumer.photo_url,
        chatEnabled: isReserved,
      };
    }
    const businessName = order.commerce.business_name;
    return {
      title: businessName,
      initials: getInitials(businessName),
      chatEnabled: isReserved,
    };
  })();

  const infoItems: InfoItem[] = (() => {
    if (!order) return [];
    if (isCommerce) {
      const items: InfoItem[] = [
        {
          label: "Cliente",
          value: buildFullName(
            order.consumer.first_name,
            order.consumer.last_name,
          ),
        },
      ];
      if (order.consumer.phone) {
        items.push({ label: "Teléfono", value: order.consumer.phone });
      }
      return items;
    }
    return buildCommerceInfoItems(order.publication.commerce);
  })();

  const confirmCancel = async () => {
    try {
      await cancelOrder(id);
      setCancelVisible(false);
      showSuccess("Reserva cancelada");
      router.back();
    } catch {
      setCancelVisible(false);
    }
  };

  const confirmDeliver = async () => {
    try {
      await deliverOrder(id);
      setDeliverVisible(false);
      setSuccessVisible(true);
    } catch {
      setDeliverVisible(false);
    }
  };

  return {
    isLoading,
    isError,
    order,
    publication,
    showFavoriteShare: !isCommerce,
    isFavorite,
    counterpart,
    infoItems,
    footerKind,
    statusNotice,
    hasUnreadChat,
    isCancelling,
    isDelivering,
    isRefetching,
    cancelVisible,
    deliverVisible,
    successVisible,
    handleBack: () => router.back(),
    handleRefresh: refetch,
    handleChat: () => {
      setLiveUnread(false);
      setChatVisited(true);
      router.push(`/chat/${id}`);
    },
    handleToggleFavorite: toggleFavorite,
    handleShare: () => {
      if (publication) void sharePublication(publication);
    },
    handleCancelPress: () => setCancelVisible(true),
    handleCloseCancel: () => setCancelVisible(false),
    confirmCancel,
    handleDeliverPress: () => setDeliverVisible(true),
    handleCloseDeliver: () => setDeliverVisible(false),
    confirmDeliver,
    handleSuccessDone: () => {
      setSuccessVisible(false);
      router.replace("/(commerce)/home");
    },
  };
};
