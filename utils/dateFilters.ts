export const getDateRange = (
  filter: "all" | "today" | "week" | "month",
): { date_from?: string; date_to?: string } => {
  if (filter === "all") return {};

  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  if (filter === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (filter === "week") {
    const day = from.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    from.setDate(from.getDate() + diff);
    from.setHours(0, 0, 0, 0);
  } else {
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
  }

  return { date_from: from.toISOString(), date_to: to.toISOString() };
};
