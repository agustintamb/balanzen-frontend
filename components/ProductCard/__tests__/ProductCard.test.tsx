import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { Publication } from "@/api/publications/publications.types";
import ProductCard from "@/components/ProductCard/ProductCard";

jest.mock("@/utils/cloudinary", () => ({
  buildCardImageUrl: jest.fn((url: string) => `card:${url}`),
}));

const FIXED_NOW = new Date("2026-06-13T12:00:00.000Z");

const buildPub = (overrides: Partial<Publication> = {}): Publication => ({
  id: "pub-1",
  title: "Empanadas criollas",
  description: "Ricas empanadas",
  original_price: 1000,
  final_price: 800,
  discount_pct: 20,
  expiry_date: "2099-12-31T23:59:59.000Z",
  category: { id: "cat-1", name: "Comida" },
  photos: ["https://example.com/photo.jpg"],
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
  created_at: "2026-06-13T08:00:00.000Z",
  updated_at: undefined,
  ...overrides,
});

describe("ProductCard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the title", () => {
    const { getByText } = render(<ProductCard publication={buildPub()} />);
    expect(getByText("Empanadas criollas")).toBeTruthy();
  });

  it("renders the status chip when showStatus is true (default)", () => {
    const { getByText } = render(<ProductCard publication={buildPub()} />);
    expect(getByText("Activa")).toBeTruthy();
  });

  it("does not render status chip when showStatus is false", () => {
    const { queryByText } = render(
      <ProductCard publication={buildPub()} showStatus={false} />,
    );
    expect(queryByText("Activa")).toBeNull();
  });

  it("renders 'Gratis' for donation publications", () => {
    const { getByText } = render(
      <ProductCard publication={buildPub({ is_donation: true })} />,
    );
    expect(getByText("Gratis")).toBeTruthy();
  });

  it("shows commerce name when showCommerce is true", () => {
    const { getByText } = render(
      <ProductCard publication={buildPub()} showCommerce={true} />,
    );
    expect(getByText("La Parrilla")).toBeTruthy();
  });

  it("does not show commerce name when showCommerce is false (default)", () => {
    const { queryByText } = render(<ProductCard publication={buildPub()} />);
    expect(queryByText("La Parrilla")).toBeNull();
  });

  it("shows address when showAddress is true", () => {
    const { getByText } = render(
      <ProductCard publication={buildPub()} showAddress={true} />,
    );
    expect(getByText("Av. Corrientes 1234")).toBeTruthy();
  });

  it("calls onPress with publication id when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ProductCard publication={buildPub()} onPress={onPress} />,
    );
    fireEvent.press(getByText("Empanadas criollas"));
    expect(onPress).toHaveBeenCalledWith("pub-1");
  });

  it("renders placeholder icon when no photos", () => {
    expect(() =>
      render(<ProductCard publication={buildPub({ photos: [] })} />),
    ).not.toThrow();
  });

  it("shows discount price when hasDiscount is true", () => {
    const { getByText } = render(<ProductCard publication={buildPub()} />);
    expect(getByText(/800/)).toBeTruthy();
  });

  it("shows notification dot when hasUnreadMessages is true", () => {
    expect(() =>
      render(<ProductCard publication={buildPub()} hasUnreadMessages={true} />),
    ).not.toThrow();
  });

  it("shows expiry warning when showExpiryWarning is true and pub expires soon", () => {
    const expiringSoon = buildPub({
      expiry_date: new Date(FIXED_NOW.getTime() + 2 * 3_600_000).toISOString(),
    });
    expect(() =>
      render(<ProductCard publication={expiringSoon} showExpiryWarning={true} showDate={false} />),
    ).not.toThrow();
  });

  it("renders RESERVED status chip correctly", () => {
    const { getByText } = render(
      <ProductCard publication={buildPub({ status: "RESERVED" })} />,
    );
    expect(getByText("Reservada")).toBeTruthy();
  });

  it("shows warning text when expiry is between 24 and 48 hours", () => {
    const expiry = new Date(FIXED_NOW.getTime() + 36 * 3_600_000).toISOString();
    const pub = buildPub({ expiry_date: expiry });
    const { getByText } = render(
      <ProductCard publication={pub} showExpiryWarning={true} showDate={false} />,
    );
    expect(getByText("Vence mañana")).toBeTruthy();
  });

  it("shows info text when expiry is more than 48 hours away", () => {
    const expiry = new Date(FIXED_NOW.getTime() + 7 * 24 * 3_600_000).toISOString();
    const pub = buildPub({ expiry_date: expiry });
    const { getByText } = render(
      <ProductCard publication={pub} showExpiryWarning={true} showDate={false} />,
    );
    expect(getByText(/Vence en \d+ días/)).toBeTruthy();
  });

  it("renders null for date area when showDate=false and no expiry warning", () => {
    const pub = buildPub();
    const { queryByText } = render(
      <ProductCard publication={pub} showDate={false} />,
    );
    expect(queryByText(/Vence/)).toBeNull();
  });
});
