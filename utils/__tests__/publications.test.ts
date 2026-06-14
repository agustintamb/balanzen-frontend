import type { Publication } from "@/api/publications/publications.types";
import {
  countExpiringPublications,
  filterPublications,
  searchPublications,
  sortPublications,
} from "@/utils/publications";

const buildPub = (overrides: Partial<Publication> = {}): Publication => ({
  id: "pub-1",
  title: "Empanadas",
  description: "Ricas empanadas",
  original_price: 1000,
  final_price: 800,
  discount_pct: 20,
  expiry_date: "2099-12-31T23:59:59.000Z",
  category: { id: "cat-1", name: "Comida" },
  photos: [],
  status: "ACTIVE",
  is_donation: false,
  commerce: {
    id: "com-1",
    business_name: "La Parrilla",
    selected_address: {
      formatted_address: "Av. Corrientes 1234",
      lat: -34,
      lng: -58,
    },
  },
  created_at: "2026-01-01T10:00:00.000Z",
  updated_at: undefined,
  ...overrides,
});

const FIXED_NOW = new Date("2026-06-13T12:00:00.000Z");

describe("sortPublications", () => {
  const older = buildPub({ id: "old", created_at: "2026-01-01T10:00:00.000Z" });
  const newer = buildPub({ id: "new", created_at: "2026-06-01T10:00:00.000Z" });

  it("sorts by most recent first with 'recent'", () => {
    const result = sortPublications([older, newer], "recent");
    expect(result[0].id).toBe("new");
    expect(result[1].id).toBe("old");
  });

  it("sorts by oldest first with 'oldest'", () => {
    const result = sortPublications([newer, older], "oldest");
    expect(result[0].id).toBe("old");
    expect(result[1].id).toBe("new");
  });

  it("does not mutate the original array", () => {
    const pubs = [newer, older];
    sortPublications(pubs, "oldest");
    expect(pubs[0].id).toBe("new");
  });

  it("returns empty array when given empty input", () => {
    expect(sortPublications([], "recent")).toEqual([]);
  });
});

describe("filterPublications", () => {
  const active = buildPub({ id: "active", status: "ACTIVE" });
  const cancelled = buildPub({ id: "cancelled", status: "CANCELLED" });
  const expired = buildPub({ id: "expired", status: "EXPIRED" });

  it("returns all publications when activeFilter is not 'CANCELLED'", () => {
    const result = filterPublications([active, cancelled, expired], "ACTIVE");
    expect(result).toHaveLength(3);
  });

  it("returns only CANCELLED and EXPIRED when activeFilter is 'CANCELLED'", () => {
    const result = filterPublications(
      [active, cancelled, expired],
      "CANCELLED",
    );
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toContain("cancelled");
    expect(result.map((p) => p.id)).toContain("expired");
    expect(result.map((p) => p.id)).not.toContain("active");
  });

  it("returns empty array when filter is 'CANCELLED' and no matching pubs", () => {
    expect(filterPublications([active], "CANCELLED")).toHaveLength(0);
  });
});

describe("searchPublications", () => {
  const pizza = buildPub({
    id: "pizza",
    title: "Pizza margherita",
    description: "Clásica",
  });
  const empanadas = buildPub({
    id: "empanadas",
    title: "Empanadas criollas",
    description: "Ricas empanadas",
  });

  it("returns all pubs when query is empty", () => {
    expect(searchPublications([pizza, empanadas], "")).toHaveLength(2);
  });

  it("filters by title (case-insensitive)", () => {
    const result = searchPublications([pizza, empanadas], "PIZZA");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("pizza");
  });

  it("filters by description (case-insensitive)", () => {
    const result = searchPublications([pizza, empanadas], "clásica");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("pizza");
  });

  it("matches partial strings", () => {
    const result = searchPublications([pizza, empanadas], "empa");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("empanadas");
  });

  it("returns empty array when no matches", () => {
    expect(searchPublications([pizza, empanadas], "sushi")).toHaveLength(0);
  });
});

describe("countExpiringPublications", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 0 when pubs is undefined", () => {
    expect(countExpiringPublications(undefined)).toBe(0);
  });

  it("returns 0 when pubs array is empty", () => {
    expect(countExpiringPublications([])).toBe(0);
  });

  it("counts pubs expiring today (within today..tomorrow window)", () => {
    const expiringToday = buildPub({
      id: "today",
      expiry_date: "2026-06-13T20:00:00.000Z",
    });
    expect(countExpiringPublications([expiringToday])).toBe(1);
  });

  it("counts pubs expiring tomorrow", () => {
    const expiringTomorrow = buildPub({
      id: "tomorrow",
      expiry_date: "2026-06-14T10:00:00.000Z",
    });
    expect(countExpiringPublications([expiringTomorrow])).toBe(1);
  });

  it("does not count pubs expiring in 2+ days", () => {
    const farFuture = buildPub({
      id: "future",
      expiry_date: "2026-06-15T10:00:00.000Z",
    });
    expect(countExpiringPublications([farFuture])).toBe(0);
  });

  it("does not count pubs with no expiry_date", () => {
    const noExpiry = buildPub({ id: "noexp", expiry_date: "" });
    // Empty string is falsy, so the filter returns false
    expect(countExpiringPublications([noExpiry])).toBe(0);
  });

  it("counts multiple expiring pubs", () => {
    const pub1 = buildPub({
      id: "p1",
      expiry_date: "2026-06-13T15:00:00.000Z",
    });
    const pub2 = buildPub({
      id: "p2",
      expiry_date: "2026-06-14T08:00:00.000Z",
    });
    const pub3 = buildPub({
      id: "p3",
      expiry_date: "2026-07-01T08:00:00.000Z",
    });
    expect(countExpiringPublications([pub1, pub2, pub3])).toBe(2);
  });
});
