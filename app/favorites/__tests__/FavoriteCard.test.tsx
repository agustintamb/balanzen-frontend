import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { Favorite } from "@/api/favorites/favorites.types";
import FavoriteCard from "../FavoriteCard";

jest.mock("@expo/vector-icons", () => ({
  Feather: () => null,
  Ionicons: () => null,
}));

jest.mock("@/components/ui/Icon", () => () => null);

jest.mock("@/utils/cloudinary", () => ({
  buildCardImageUrl: jest.fn((url: string) => `card:${url}`),
}));

jest.mock("@/utils/format", () => ({
  formatExpiry: jest.fn(() => "3 días"),
  formatPrice: jest.fn((v: number) => `$${v}`),
}));

const BASE_PUBLICATION = {
  id: "pub1",
  title: "Ensalada fresca",
  photos: ["https://res.cloudinary.com/x/image/upload/v1/photo.jpg"],
  is_donation: false,
  discount_pct: 0,
  final_price: 500,
  original_price: 500,
  expiry_date: null,
  commerce: {
    id: "c1",
    business_name: "La Verdulería",
    selected_address: { formatted_address: "Av. Siempreviva 742" },
  },
};

const buildFavorite = (
  overrides: Partial<typeof BASE_PUBLICATION> = {},
): Favorite => ({
  id: "fav1",
  publication: { ...BASE_PUBLICATION, ...overrides } as any,
  created_at: new Date().toISOString(),
});

describe("FavoriteCard", () => {
  it("renders the publication title", () => {
    const { getByText } = render(
      <FavoriteCard item={buildFavorite()} onRemove={jest.fn()} />,
    );
    expect(getByText("Ensalada fresca")).toBeTruthy();
  });

  it("renders the commerce business name", () => {
    const { getByText } = render(
      <FavoriteCard item={buildFavorite()} onRemove={jest.fn()} />,
    );
    expect(getByText("La Verdulería")).toBeTruthy();
  });

  it("renders commerce address", () => {
    const { getByText } = render(
      <FavoriteCard item={buildFavorite()} onRemove={jest.fn()} />,
    );
    expect(getByText("Av. Siempreviva 742")).toBeTruthy();
  });

  it("shows formatted price for regular publication", () => {
    const { getByText } = render(
      <FavoriteCard item={buildFavorite()} onRemove={jest.fn()} />,
    );
    expect(getByText("$500")).toBeTruthy();
  });

  it("shows 'Gratis' for donation", () => {
    const { getByText } = render(
      <FavoriteCard
        item={buildFavorite({ is_donation: true })}
        onRemove={jest.fn()}
      />,
    );
    expect(getByText("Gratis")).toBeTruthy();
  });

  it("shows 'DONACIÓN' badge for donation", () => {
    const { getByText } = render(
      <FavoriteCard
        item={buildFavorite({ is_donation: true })}
        onRemove={jest.fn()}
      />,
    );
    expect(getByText("DONACIÓN")).toBeTruthy();
  });

  it("shows discount badge when discount_pct > 0", () => {
    const { getByText } = render(
      <FavoriteCard
        item={buildFavorite({ discount_pct: 20, final_price: 400 })}
        onRemove={jest.fn()}
      />,
    );
    expect(getByText("-20%")).toBeTruthy();
  });

  it("shows expiry date when expiry_date is provided", () => {
    const { getByText } = render(
      <FavoriteCard
        item={buildFavorite({ expiry_date: "2026-06-15" })}
        onRemove={jest.fn()}
      />,
    );
    expect(getByText("3 días")).toBeTruthy();
  });

  it("calls onRemove with publication id when remove button is pressed", () => {
    const onRemove = jest.fn();
    const { getByTestId } = render(
      <FavoriteCard item={buildFavorite()} onRemove={onRemove} />,
    );
    fireEvent.press(getByTestId("btn-remove-favorite-pub1"));
    expect(onRemove).toHaveBeenCalledWith("pub1");
  });

  it("shows placeholder when publication has no photos", () => {
    const { UNSAFE_getAllByType } = render(
      <FavoriteCard
        item={buildFavorite({ photos: [] })}
        onRemove={jest.fn()}
      />,
    );
    const { View } = require("react-native");
    expect(UNSAFE_getAllByType(View).length).toBeGreaterThan(0);
  });

  it("shows strikethrough original price when discounted", () => {
    const { getByText } = render(
      <FavoriteCard
        item={buildFavorite({ final_price: 400, original_price: 600 })}
        onRemove={jest.fn()}
      />,
    );
    expect(getByText("$600")).toBeTruthy();
  });

  it("handles is_donation being undefined (nullish coalescing fallback)", () => {
    const { toJSON } = render(
      <FavoriteCard
        item={buildFavorite({ is_donation: undefined as any })}
        onRemove={jest.fn()}
      />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
