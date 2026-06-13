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

const DAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const MONTHS_SHORT_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Formats a timestamp as "Hoy, 14:30", "Ayer, 10:15", or "Lunes 7 Abr, 18:00". */
export const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  const time = `${hh}:${mm}`;

  if (isSameDay(date, now)) return `Hoy, ${time}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) return `Ayer, ${time}`;

  const dayName = DAYS_ES[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_SHORT_ES[date.getMonth()];
  return `${dayName} ${day} ${month}, ${time}`;
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
