import type { PublicationStatus } from "@/api/publications/publications.types";
import type { ChipProps } from "@/components/ui/Chip";
import { formatRelativeDate } from "@/utils/format";

export const STATUS_LABEL: Record<PublicationStatus, string> = {
  ACTIVE: "Activa",
  RESERVED: "Reservada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
  EXPIRED: "Vencida",
};

export const STATUS_CHIP_VARIANT: Record<
  PublicationStatus,
  ChipProps["variant"]
> = {
  ACTIVE: "primary",
  RESERVED: "warning",
  DELIVERED: "info",
  CANCELLED: "error",
  EXPIRED: "error",
};

export const formatPrice = (price: number): string =>
  `$${price.toLocaleString("es-AR")}`;

export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

export const getExpiryWarning = (
  expiryDate: string,
): { label: string; level: "urgent" | "warning" | "info" } | null => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const hoursLeft = (expiry.getTime() - now.getTime()) / 3_600_000;
  if (hoursLeft <= 0) return null;
  if (hoursLeft <= 24) return { label: "Vence hoy", level: "urgent" };
  if (hoursLeft <= 48) return { label: "Vence mañana", level: "warning" };
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const expiryDay = new Date(expiry);
  expiryDay.setHours(0, 0, 0, 0);
  const days = Math.round((expiryDay.getTime() - today.getTime()) / 86_400_000);
  return { label: `Vence en ${days} días`, level: "info" };
};

export const formatCreatedAt = formatRelativeDate;

export const getPublicationDateLabel = (
  status: PublicationStatus,
  created_at: string,
  updated_at: string | undefined,
): string => {
  const resolvedDate = updated_at ?? created_at;
  if (status === "RESERVED")
    return `Reservada ${formatRelativeDate(resolvedDate)}`;
  if (status === "DELIVERED")
    return `Entregada ${formatRelativeDate(resolvedDate)}`;
  if (status === "CANCELLED")
    return `Cancelada ${formatRelativeDate(resolvedDate)}`;
  if (status === "EXPIRED")
    return `Expirada ${formatRelativeDate(resolvedDate)}`;
  return `Creada ${formatRelativeDate(created_at)}`;
};
