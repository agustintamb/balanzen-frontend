import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { PublicationStatus } from "@/api/publications/publications.types";
import type { StatusNotice } from "@/components/ProductDetail/StatusNoticeBanner";
import {
  buildCommerceInfoItems,
  getInitials,
  sharePublication,
  type InfoItem,
} from "@/components/ProductDetail/utils";
import type { IconName } from "@/components/ui/Icon";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { useCreateOrder } from "@/hooks/useOrders";
import { useDeletePublication, usePublication } from "@/hooks/usePublications";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";

export interface CounterpartConfig {
  title: string;
  subtitle?: string;
  initials?: string;
  leftIcon?: IconName;
  chatEnabled: boolean;
}

export type DetailFooterKind = "reserve" | "commerce" | "none";

const OWNER_TERMINAL_NOTICES: Partial<Record<PublicationStatus, StatusNotice>> =
  {
    DELIVERED: {
      icon: "check-circle",
      tone: "success",
      text: "Esta publicación fue entregada.",
    },
    CANCELLED: {
      icon: "x-circle",
      tone: "muted",
      text: "Esta publicación fue cancelada.",
    },
    EXPIRED: {
      icon: "clock",
      tone: "muted",
      text: "Esta publicación venció.",
    },
  };

export const usePublicationDetailScreen = () => {
  const router = useRouter();
  const { id = "" } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { showSuccess } = useToast();

  const {
    data: publication,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = usePublication(id);
  const { isFavorite, toggleFavorite } = useFavoriteToggle(id);
  const { mutateAsync: createOrder, isPending: isReserving } = useCreateOrder();
  const { mutateAsync: deletePublication, isPending: isDeleting } =
    useDeletePublication();

  const [reserveVisible, setReserveVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const isCommerce = user?.role === "COMERCIO";
  const isOwner = isCommerce && publication?.commerce.id === user?.id;
  const isActive = !isError && publication?.status === "ACTIVE";

  useEffect(() => {
    if (isOwner && publication?.status === "RESERVED" && publication.order_id) {
      router.replace(`/order/${publication.order_id}`);
    }
  }, [isOwner, publication?.status, publication?.order_id, router]);

  const statusNotice: StatusNotice | null = (() => {
    if (!publication || isActive) return null;
    if (isError) {
      return {
        icon: "info",
        tone: "muted",
        text: "Esta publicación ya no está disponible.",
      };
    }
    if (isOwner) return OWNER_TERMINAL_NOTICES[publication.status] ?? null;
    return {
      icon: "info",
      tone: "muted",
      text: "Esta publicación ya no está disponible.",
    };
  })();

  let footerKind: DetailFooterKind = "none";
  if (isActive && isOwner) footerKind = "commerce";
  else if (isActive && !isCommerce) footerKind = "reserve";

  const counterpart: CounterpartConfig | null = (() => {
    if (!publication) return null;
    if (isOwner) {
      if (!isActive) return null;
      return {
        title: "Sin reserva aún",
        subtitle: "Esta publicación está disponible",
        leftIcon: "shopping-bag",
        chatEnabled: false,
      };
    }
    return {
      title: publication.commerce.business_name,
      initials: getInitials(publication.commerce.business_name),
      chatEnabled: false,
    };
  })();

  const infoItems: InfoItem[] =
    publication && !isOwner ? buildCommerceInfoItems(publication.commerce) : [];

  const confirmReserve = async () => {
    try {
      const order = await createOrder(id);
      setReserveVisible(false);
      router.replace(`/order/${order.id}`);
    } catch {
      setReserveVisible(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deletePublication(id);
      setDeleteVisible(false);
      showSuccess("Publicación eliminada");
      router.back();
    } catch {
      setDeleteVisible(false);
    }
  };

  return {
    isLoading,
    isError,
    publication,
    showFavoriteShare: !isCommerce,
    isFavorite,
    counterpart,
    infoItems,
    footerKind,
    statusNotice,
    isReserving,
    isDeleting,
    isRefetching,
    reserveVisible,
    deleteVisible,
    handleBack: () => router.back(),
    handleRefresh: refetch,
    handleToggleFavorite: toggleFavorite,
    handleShare: () => {
      if (publication) void sharePublication(publication);
    },
    handleReservePress: () => setReserveVisible(true),
    handleCloseReserve: () => setReserveVisible(false),
    confirmReserve,
    handleDeletePress: () => setDeleteVisible(true),
    handleCloseDelete: () => setDeleteVisible(false),
    confirmDelete,
    handleEdit: () => router.push(`/publish-product/${id}`),
  };
};
