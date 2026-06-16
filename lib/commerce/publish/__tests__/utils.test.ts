import {
  buildPublicationBody,
  isStep1Complete,
  isStep2Complete,
  parsePrice,
  publicationPhotosToItems,
  publicationToFormValues,
  sortCategories,
} from "@/lib/commerce/publish/utils";
import type { PublishFormValues } from "@/lib/commerce/publish/types";
import type { Publication } from "@/api/publications/publications.types";
import type { Category } from "@/api/categories/categories.types";

const baseValues: PublishFormValues = {
  title: "Verduras frescas",
  description: "Mix de verduras",
  expiry_date: new Date("2026-12-31"),
  category_id: "cat-1",
  is_donation: false,
  final_price: "500",
  original_price: "1000",
};

const makeCategory = (id: string, name: string): Category =>
  ({ id, name } as Category);

describe("parsePrice", () => {
  it("returns NaN for empty string", () => {
    expect(parsePrice("")).toBeNaN();
  });

  it("returns NaN for whitespace-only string", () => {
    expect(parsePrice("   ")).toBeNaN();
  });

  it("returns the number for a valid numeric string", () => {
    expect(parsePrice("500")).toBe(500);
  });

  it("returns NaN for a non-numeric string", () => {
    expect(parsePrice("abc")).toBeNaN();
  });

  it("returns NaN for Infinity", () => {
    expect(parsePrice("Infinity")).toBeNaN();
  });

  it("parses zero correctly", () => {
    expect(parsePrice("0")).toBe(0);
  });
});

describe("isStep1Complete", () => {
  it("returns true when all fields are filled", () => {
    expect(isStep1Complete(baseValues)).toBe(true);
  });

  it("returns false when title is empty", () => {
    expect(isStep1Complete({ ...baseValues, title: "" })).toBe(false);
  });

  it("returns false when title is whitespace only", () => {
    expect(isStep1Complete({ ...baseValues, title: "   " })).toBe(false);
  });

  it("returns false when description is empty", () => {
    expect(isStep1Complete({ ...baseValues, description: "" })).toBe(false);
  });

  it("returns false when category_id is empty", () => {
    expect(isStep1Complete({ ...baseValues, category_id: "" })).toBe(false);
  });

  it("returns false when expiry_date is null", () => {
    expect(isStep1Complete({ ...baseValues, expiry_date: null })).toBe(false);
  });
});

describe("isStep2Complete", () => {
  it("returns true when is_donation is true regardless of prices", () => {
    expect(
      isStep2Complete({ ...baseValues, is_donation: true, final_price: "", original_price: "" }),
    ).toBe(true);
  });

  it("returns true when final_price <= original_price and both > 0", () => {
    expect(isStep2Complete(baseValues)).toBe(true);
  });

  it("returns false when final_price > original_price", () => {
    expect(
      isStep2Complete({ ...baseValues, final_price: "1200", original_price: "1000" }),
    ).toBe(false);
  });

  it("returns false when final_price is 0", () => {
    expect(
      isStep2Complete({ ...baseValues, final_price: "0", original_price: "1000" }),
    ).toBe(false);
  });

  it("returns false when original_price is empty", () => {
    expect(isStep2Complete({ ...baseValues, original_price: "" })).toBe(false);
  });
});

describe("sortCategories", () => {
  it("places a category named 'Otros' at the end", () => {
    const cats = [makeCategory("1", "Otros"), makeCategory("2", "Frutas")];
    const result = sortCategories(cats);
    expect(result[result.length - 1].name).toBe("Otros");
  });

  it("places a category named 'Otro' at the end (singular)", () => {
    const cats = [makeCategory("1", "Otro"), makeCategory("2", "Verduras")];
    const result = sortCategories(cats);
    expect(result[result.length - 1].name).toBe("Otro");
  });

  it("is case-insensitive for Otros", () => {
    const cats = [makeCategory("1", "OTROS"), makeCategory("2", "Lácteos")];
    const result = sortCategories(cats);
    expect(result[result.length - 1].name).toBe("OTROS");
  });

  it("preserves relative order of non-Otros categories", () => {
    const cats = [
      makeCategory("1", "Frutas"),
      makeCategory("2", "Otros"),
      makeCategory("3", "Lácteos"),
    ];
    const result = sortCategories(cats);
    expect(result.map((c) => c.name)).toEqual(["Frutas", "Lácteos", "Otros"]);
  });

  it("returns a copy, not the original array", () => {
    const cats = [makeCategory("1", "Frutas")];
    const result = sortCategories(cats);
    expect(result).not.toBe(cats);
  });
});

describe("buildPublicationBody", () => {
  it("builds the body from non-donation form values", () => {
    const body = buildPublicationBody(baseValues, ["https://img/1.jpg"]);
    expect(body.title).toBe("Verduras frescas");
    expect(body.description).toBe("Mix de verduras");
    expect(body.final_price).toBe(500);
    expect(body.original_price).toBe(1000);
    expect(body.category_id).toBe("cat-1");
    expect(body.photos).toEqual(["https://img/1.jpg"]);
  });

  it("sets both prices to 0 for a donation", () => {
    const body = buildPublicationBody(
      { ...baseValues, is_donation: true },
      [],
    );
    expect(body.final_price).toBe(0);
    expect(body.original_price).toBe(0);
  });

  it("trims title and description", () => {
    const body = buildPublicationBody(
      { ...baseValues, title: "  Verduras  ", description: "  Mix  " },
      [],
    );
    expect(body.title).toBe("Verduras");
    expect(body.description).toBe("Mix");
  });

  it("serializes expiry_date as ISO string", () => {
    const body = buildPublicationBody(baseValues, []);
    expect(body.expiry_date).toBe(new Date("2026-12-31").toISOString());
  });
});

describe("publicationToFormValues", () => {
  const pub = {
    id: "p1",
    title: "Mix",
    description: "Desc",
    expiry_date: "2026-12-31T00:00:00.000Z",
    category: { id: "cat-1", name: "Frutas" },
    is_donation: false,
    final_price: 500,
    original_price: 1000,
    photos: [],
  } as unknown as Publication;

  it("maps a non-donation publication to form values", () => {
    const values = publicationToFormValues(pub);
    expect(values.title).toBe("Mix");
    expect(values.final_price).toBe("500");
    expect(values.original_price).toBe("1000");
    expect(values.is_donation).toBe(false);
    expect(values.category_id).toBe("cat-1");
  });

  it("maps a donation publication with empty price strings", () => {
    const values = publicationToFormValues({
      ...pub,
      is_donation: true,
      final_price: 0,
      original_price: 0,
    } as unknown as Publication);
    expect(values.final_price).toBe("");
    expect(values.original_price).toBe("");
    expect(values.is_donation).toBe(true);
  });

  it("converts expiry_date string to a Date object", () => {
    const values = publicationToFormValues(pub);
    expect(values.expiry_date).toBeInstanceOf(Date);
  });
});

describe("publicationPhotosToItems", () => {
  it("maps URLs to PhotoItem objects with 'done' status", () => {
    const items = publicationPhotosToItems(["https://img/1.jpg", "https://img/2.jpg"]);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      id: "existing-0",
      uri: "https://img/1.jpg",
      url: "https://img/1.jpg",
      status: "done",
    });
    expect(items[1].id).toBe("existing-1");
  });

  it("returns empty array for empty input", () => {
    expect(publicationPhotosToItems([])).toEqual([]);
  });
});
