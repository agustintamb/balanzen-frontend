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
  const days = Math.round(
    (expiryDay.getTime() - today.getTime()) / 86_400_000,
  );
  return { label: `Vence en ${days} días`, level: "info" };
};
