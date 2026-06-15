import type { Publication } from "@/api/publications/publications.types";
import { buildFullName, getInitials, getSavings } from "../utils";

const buildPublication = (overrides: Partial<Publication> = {}): Publication =>
  ({
    original_price: 2400,
    final_price: 1200,
  }) as Publication & typeof overrides;

describe("ProductDetail utils", () => {
  describe("getSavings", () => {
    it("returns the difference between original and final price", () => {
      expect(getSavings(buildPublication())).toBe(1200);
    });

    it("clamps to 0 when final price is greater than original", () => {
      expect(
        getSavings({ original_price: 100, final_price: 300 } as Publication),
      ).toBe(0);
    });

    it("returns 0 when prices are equal (donation)", () => {
      expect(
        getSavings({ original_price: 500, final_price: 500 } as Publication),
      ).toBe(0);
    });
  });

  describe("buildFullName", () => {
    it("joins first and last name", () => {
      expect(buildFullName("María", "Alejandra")).toBe("María Alejandra");
    });

    it("trims when a part is empty", () => {
      expect(buildFullName("Juan", "")).toBe("Juan");
    });
  });

  describe("getInitials", () => {
    it("returns up to two uppercase initials", () => {
      expect(getInitials("María Alejandra")).toBe("MA");
    });

    it("uses only the first letter for a single word", () => {
      expect(getInitials("Juan")).toBe("J");
    });

    it("returns an empty string for an empty name", () => {
      expect(getInitials("")).toBe("");
    });

    it("ignores extra whitespace", () => {
      expect(getInitials("  Ana   Lopez  ")).toBe("AL");
    });
  });
});
