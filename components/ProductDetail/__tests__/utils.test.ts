import { Share } from "react-native";
import type {
  Publication,
  PublicationCommerce,
} from "@/api/publications/publications.types";
import {
  buildCommerceInfoItems,
  buildFullName,
  getInitials,
  getSavings,
  sharePublication,
} from "../utils";

const buildPublication = (overrides: Partial<Publication> = {}): Publication =>
  ({
    title: "Pan",
    original_price: 2400,
    final_price: 1200,
    commerce: { business_name: "Panadería" },
    ...overrides,
  }) as Publication;

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

  describe("buildCommerceInfoItems", () => {
    it("includes owner, phone and address when present", () => {
      const commerce = {
        business_name: "Verdulería Natura",
        first_name: "María",
        last_name: "López",
        phone: "1144556677",
        selected_address: { formatted_address: "Av. Santa Fe 2150" },
      } as PublicationCommerce;
      expect(buildCommerceInfoItems(commerce).map((i) => i.label)).toEqual([
        "Comercio",
        "Dueño",
        "Teléfono",
        "Dirección",
      ]);
    });

    it("returns only the business name when the rest is missing", () => {
      const commerce = {
        business_name: "Solo Nombre",
        selected_address: {},
      } as PublicationCommerce;
      expect(buildCommerceInfoItems(commerce)).toEqual([
        { label: "Comercio", value: "Solo Nombre" },
      ]);
    });
  });

  describe("sharePublication", () => {
    afterEach(() => jest.restoreAllMocks());

    it("invokes the native share sheet with title and price", async () => {
      const spy = jest
        .spyOn(Share, "share")
        .mockResolvedValue({ action: "sharedAction" } as never);
      await sharePublication(buildPublication());
      expect(spy).toHaveBeenCalledWith({
        message: expect.stringContaining("Pan"),
      });
    });

    it("swallows errors when sharing fails", async () => {
      jest.spyOn(Share, "share").mockRejectedValue(new Error("nope"));
      await expect(
        sharePublication(buildPublication()),
      ).resolves.toBeUndefined();
    });
  });
});
