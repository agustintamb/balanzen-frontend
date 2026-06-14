import type { Order } from "@/api/orders/orders.types";
import { sortAndSearchOrders } from "@/utils/orders";

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "order-1",
  publication: {
    id: "pub-1",
    title: "Empanadas",
    final_price: 500,
    photos: [],
  },
  consumer: { id: "c1", first_name: "Ana", last_name: "Pérez" },
  commerce: {
    id: "com-1",
    business_name: "La Parrilla",
    selected_address: { formatted_address: "Av. Corrientes 1234" },
  },
  status: "RESERVED",
  created_at: "2026-01-01T10:00:00.000Z",
  updated_at: undefined,
  unread_count: 0,
  ...overrides,
});

describe("sortAndSearchOrders", () => {
  const older = buildOrder({
    id: "order-old",
    created_at: "2026-01-01T10:00:00.000Z",
    publication: {
      id: "pub-1",
      title: "Empanadas",
      final_price: 500,
      photos: [],
    },
  });
  const newer = buildOrder({
    id: "order-new",
    created_at: "2026-06-01T10:00:00.000Z",
    publication: {
      id: "pub-2",
      title: "Pizza",
      final_price: 800,
      photos: [],
    },
  });

  describe("when orders is undefined", () => {
    it("returns an empty array", () => {
      expect(sortAndSearchOrders(undefined, "recent", "")).toEqual([]);
    });
  });

  describe("sorting", () => {
    it("sorts by most recent first when activeSort is 'recent'", () => {
      const result = sortAndSearchOrders([older, newer], "recent", "");
      expect(result[0].id).toBe("order-new");
      expect(result[1].id).toBe("order-old");
    });

    it("sorts by oldest first when activeSort is 'oldest'", () => {
      const result = sortAndSearchOrders([newer, older], "oldest", "");
      expect(result[0].id).toBe("order-old");
      expect(result[1].id).toBe("order-new");
    });

    it("does not mutate the original array", () => {
      const original = [newer, older];
      sortAndSearchOrders(original, "oldest", "");
      expect(original[0].id).toBe("order-new");
    });
  });

  describe("searching", () => {
    it("filters orders by publication title (case-insensitive)", () => {
      const result = sortAndSearchOrders([older, newer], "recent", "pizza");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("order-new");
    });

    it("returns all orders when search is empty string", () => {
      const result = sortAndSearchOrders([older, newer], "recent", "");
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no orders match the search", () => {
      const result = sortAndSearchOrders([older, newer], "recent", "sushi");
      expect(result).toHaveLength(0);
    });

    it("matches partial title strings", () => {
      const result = sortAndSearchOrders([older, newer], "recent", "empa");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("order-old");
    });

    it("matches title regardless of case", () => {
      const result = sortAndSearchOrders([older, newer], "recent", "PIZZA");
      expect(result).toHaveLength(1);
    });
  });

  describe("combined sort and search", () => {
    it("applies search filter before sorting", () => {
      const mid = buildOrder({
        id: "order-mid",
        created_at: "2026-03-15T10:00:00.000Z",
        publication: {
          id: "pub-3",
          title: "Pizza grande",
          final_price: 1000,
          photos: [],
        },
      });
      const result = sortAndSearchOrders(
        [older, newer, mid],
        "oldest",
        "pizza",
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("order-mid");
      expect(result[1].id).toBe("order-new");
    });
  });
});
