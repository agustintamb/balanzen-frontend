jest.mock("@/utils/cloudinary", () => ({
  buildCardImageUrl: jest.fn((url: string) => `card:${url}`),
}));

import ProductCard from "@/components/ProductCard";

describe("ProductCard barrel", () => {
  it("re-exports ProductCard as default", () => {
    expect(ProductCard).toBeDefined();
    expect(typeof ProductCard).toBe("function");
  });
});
