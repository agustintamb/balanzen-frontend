import type { Order } from "@/api/orders/orders.types";

export const sortAndSearchOrders = (
  orders: Order[] | undefined,
  activeSort: "recent" | "oldest",
  activeSearch: string,
): Order[] => {
  const baseOrders = orders ?? [];
  const filtered = activeSearch
    ? baseOrders.filter((o) =>
        o.publication.title.toLowerCase().includes(activeSearch.toLowerCase()),
      )
    : baseOrders;

  if (activeSort === "oldest") {
    return [...filtered].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  return [...filtered].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};
