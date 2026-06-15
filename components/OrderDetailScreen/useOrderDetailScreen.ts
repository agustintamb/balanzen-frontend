import { useState } from "react";
import { Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  buildCommerceInfoItems,
  buildFullName,
  formatPrice,
  getInitials,
  type InfoItem,
} from "@/components/ProductDetail/utils";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { useCancelOrder, useDeliverOrder, useOrder } from "@/hooks/useOrders";
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
  const { isFavorite, toggleFavorite } = useFavoriteToggle(publication?.id);
  const { mutateAsync: cancelOrder, isPending: isCancelling } =
    useCancelOrder();
  const { mutateAsync: deliverOrder, isPending: isDelivering } =
    useDeliverOrder();

  const [cancelVisible, setCancelVisible] = useState(false);
  const [deliverVisible, setDeliverVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const isCommerce = user?.role === "COMERCIO";
  const isReserved = order?.status === "RESERVED";

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

  // Card de datos: el comercio ve datos del cliente que reservó; el consumidor,
  // datos del comercio.
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

  const handleBack = () => router.back();
  const handleChat = () => router.push(`/chat/${id}`);

  const handleShare = async () => {
    if (!publication) return;
    try {
      await Share.share({
        message: `${publication.title} — ${formatPrice(publication.final_price)} en ${publication.commerce.business_name}`,
      });
    } catch {
      // El usuario canceló o el share falló.
    }
  };

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

  const handleSuccessDone = () => {
    setSuccessVisible(false);
    router.replace("/(commerce)/home");
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
    isCancelling,
    isDelivering,
    isRefetching,
    cancelVisible,
    deliverVisible,
    successVisible,
    handleBack,
    handleRefresh: refetch,
    handleChat,
    handleToggleFavorite: toggleFavorite,
    handleShare,
    handleCancelPress: () => setCancelVisible(true),
    handleCloseCancel: () => setCancelVisible(false),
    confirmCancel,
    handleDeliverPress: () => setDeliverVisible(true),
    handleCloseDeliver: () => setDeliverVisible(false),
    confirmDeliver,
    handleSuccessDone,
  };
};
