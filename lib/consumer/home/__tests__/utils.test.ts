import type { Category } from "@/api/categories/categories.types";
import {
  buildCategoryFilters,
  buildPublicationFilters,
} from "@/lib/consumer/home/utils";
import type { PublicationFiltersArgs } from "@/lib/consumer/home/utils";

const cat = (id: string, name: string): Category =>
  ({ id, name });

const baseArgs = (): PublicationFiltersArgs => ({
  activeSearch: "",
  selectedCategory: "all",
  activePubType: "all",
  activeMaxRadius: "any",
  activeSortBy: "created_at",
  hasLatLng: false,
  lat: null,
  lng: null,
});

describe("buildCategoryFilters", () => {
  it("returns only the Todas option when categories is undefined", () => {
    expect(buildCategoryFilters(undefined)).toEqual([
      { key: "all", label: "Todas" },
    ]);
  });

  it("returns Todas followed by the single category", () => {
    const result = buildCategoryFilters([cat("1", "Frutas")]);
    expect(result).toEqual([
      { key: "all", label: "Todas" },
      { key: "1", label: "Frutas" },
    ]);
  });

  it("sorts Otros to the end regardless of its original position", () => {
    const categories = [
      cat("3", "Otros"),
      cat("1", "Frutas"),
      cat("2", "Verduras"),
    ];
    const result = buildCategoryFilters(categories);
    expect(result.at(-1)).toEqual({ key: "3", label: "Otros" });
  });

  it("is case-insensitive when detecting Otros", () => {
    const categories = [cat("99", "OTROS"), cat("1", "Frutas")];
    const result = buildCategoryFilters(categories);
    expect(result.at(-1)).toEqual({ key: "99", label: "OTROS" });
  });

  it("preserves relative order of non-Otros categories", () => {
    const categories = [
      cat("1", "Frutas"),
      cat("2", "Verduras"),
      cat("3", "Lácteos"),
    ];
    const result = buildCategoryFilters(categories);
    const keys = result.map((r) => r.key);
    expect(keys).toEqual(["all", "1", "2", "3"]);
  });

  it("does not mutate the original array", () => {
    const categories = [cat("3", "Otros"), cat("1", "Frutas")];
    const original = [...categories];
    buildCategoryFilters(categories);
    expect(categories).toEqual(original);
  });
});

describe("buildPublicationFilters", () => {
  it("always includes limit", () => {
    const result = buildPublicationFilters(baseArgs());
    expect(result.limit).toBeGreaterThan(0);
  });

  it("includes search param when activeSearch is non-empty", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeSearch: "manzana",
    });
    expect(result).toMatchObject({ search: "manzana" });
  });

  it("omits search param when activeSearch is empty", () => {
    const result = buildPublicationFilters(baseArgs());
    expect(result).not.toHaveProperty("search");
  });

  it("includes category_id when selectedCategory is not all", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      selectedCategory: "cat-42",
    });
    expect(result).toMatchObject({ category_id: "cat-42" });
  });

  it("omits category_id when selectedCategory is all", () => {
    const result = buildPublicationFilters(baseArgs());
    expect(result).not.toHaveProperty("category_id");
  });

  it("sets donation true for donation pub type", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activePubType: "donation",
    });
    expect(result).toMatchObject({ donation: true });
    expect(result).not.toHaveProperty("min_discount");
  });

  it("sets min_discount and donation false for discount pub type", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activePubType: "discount",
    });
    expect(result).toMatchObject({ min_discount: 1, donation: false });
  });

  it("omits donation and min_discount for all pub type", () => {
    const result = buildPublicationFilters(baseArgs());
    expect(result).not.toHaveProperty("donation");
    expect(result).not.toHaveProperty("min_discount");
  });

  it("falls back to created_at sort when distance is requested but hasLatLng is false", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeSortBy: "distance",
      hasLatLng: false,
    });
    expect(result.sort_by).toBe("created_at");
    expect(result.sort_order).toBe("desc");
  });

  it("uses distance sort when activeSortBy is distance and hasLatLng is true", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeSortBy: "distance",
      hasLatLng: true,
      lat: -34.6,
      lng: -58.4,
    });
    expect(result.sort_by).toBe("distance");
    expect(result.sort_order).toBe("asc");
  });

  it("includes radius_km when radius is set and hasLatLng is true", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeMaxRadius: "5",
      hasLatLng: true,
      lat: -34.6,
      lng: -58.4,
    });
    expect(result).toMatchObject({ radius_km: 5 });
  });

  it("omits radius_km when hasLatLng is false even if radius is set", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeMaxRadius: "5",
      hasLatLng: false,
    });
    expect(result).not.toHaveProperty("radius_km");
  });

  it("omits radius_km when activeMaxRadius is any", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeMaxRadius: "any",
      hasLatLng: true,
      lat: -34.6,
      lng: -58.4,
    });
    expect(result).not.toHaveProperty("radius_km");
  });

  it("includes lat and lng when hasLatLng is true and coordinates are provided", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      hasLatLng: true,
      lat: -34.6,
      lng: -58.4,
    });
    expect(result).toMatchObject({ lat: -34.6, lng: -58.4 });
  });

  it("omits lat and lng when hasLatLng is false", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      hasLatLng: false,
      lat: -34.6,
      lng: -58.4,
    });
    expect(result).not.toHaveProperty("lat");
    expect(result).not.toHaveProperty("lng");
  });

  it("omits lat and lng when coordinates are null even if hasLatLng is true", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      hasLatLng: true,
      lat: null,
      lng: null,
    });
    expect(result).not.toHaveProperty("lat");
    expect(result).not.toHaveProperty("lng");
  });

  it("uses desc sort_order for discount_pct", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeSortBy: "discount_pct",
    });
    expect(result.sort_by).toBe("discount_pct");
    expect(result.sort_order).toBe("desc");
  });

  it("uses asc sort_order for expiry_date", () => {
    const result = buildPublicationFilters({
      ...baseArgs(),
      activeSortBy: "expiry_date",
    });
    expect(result.sort_by).toBe("expiry_date");
    expect(result.sort_order).toBe("asc");
  });

  it("combines all params correctly", () => {
    const result = buildPublicationFilters({
      activeSearch: "pan",
      selectedCategory: "cat-1",
      activePubType: "discount",
      activeMaxRadius: "10",
      activeSortBy: "discount_pct",
      hasLatLng: true,
      lat: -34.6,
      lng: -58.4,
    });
    expect(result).toMatchObject({
      search: "pan",
      category_id: "cat-1",
      min_discount: 1,
      donation: false,
      radius_km: 10,
      lat: -34.6,
      lng: -58.4,
      sort_by: "discount_pct",
      sort_order: "desc",
    });
  });
});
