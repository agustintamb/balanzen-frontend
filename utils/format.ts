export const formatCurrency = (n: number): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace("ARS", "$");

export const formatPrice = (n: number): string =>
  `$${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(Math.round(n))}`;

export const formatExpiry = (dateStr: string): string => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setUTCHours(0, 0, 0, 0);
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "Vencido";
  if (diffDays === 0) return "Vence hoy";
  if (diffDays === 1) return "Vence mañana";
  return `Vence en ${diffDays} días`;
};

export const formatTimeAgo = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  return new Date(isoDate).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  });
};
