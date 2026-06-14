import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { Publication } from "@/api/publications/publications.types";
import ConsumerPublicationCard from "@/components/ConsumerPublicationCard/ConsumerPublicationCard";

jest.mock("@/utils/cloudinary", () => ({
  buildCardImageUrl: jest.fn((url: string) => `card:${url}`),
}));

const buildPub = (overrides: Partial<Publication> = {}): Publication => ({
  id: "pub-1",
  title: "Pizza margherita",
  description: "Clásica pizza",
  original_price: 2000,
  final_price: 1400,
  discount_pct: 30,
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
  created_at: "2026-06-01T10:00:00.000Z",
  updated_at: undefined,
  ...overrides,
});

describe("ConsumerPublicationCard", () => {
  it("renders the publication title", () => {
    const { getByText } = render(
      <ConsumerPublicationCard publication={buildPub()} />,
    );
    expect(getByText("Pizza margherita")).toBeTruthy();
  });

  it("renders the commerce name", () => {
    const { getByText } = render(
      <ConsumerPublicationCard publication={buildPub()} />,
    );
    expect(getByText("La Parrilla")).toBeTruthy();
  });

  it("renders the final price", () => {
    const { getByText } = render(
      <ConsumerPublicationCard publication={buildPub()} />,
    );
    expect(getByText(/1\.400|1400/)).toBeTruthy();
  });

  it("renders 'Gratis' for donation publications", () => {
    const { getByText } = render(
      <ConsumerPublicationCard
        publication={buildPub({ is_donation: true })}
      />,
    );
    expect(getByText("Gratis")).toBeTruthy();
  });

  it("shows the discount percentage badge when discount_pct > 0", () => {
    const { getByText } = render(
      <ConsumerPublicationCard publication={buildPub()} />,
    );
    expect(getByText("-30%")).toBeTruthy();
  });

  it("does not show discount badge when is_donation is true", () => {
    const { queryByText } = render(
      <ConsumerPublicationCard
        publication={buildPub({ is_donation: true, discount_pct: 30 })}
      />,
    );
    expect(queryByText(/-\d+%/)).toBeNull();
  });

  it("renders placeholder when no photos", () => {
    expect(() =>
      render(
        <ConsumerPublicationCard publication={buildPub({ photos: [] })} />,
      ),
    ).not.toThrow();
  });

  it("calls onPress with the publication id when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ConsumerPublicationCard publication={buildPub()} onPress={onPress} />,
    );
    fireEvent.press(getByText("Pizza margherita"));
    expect(onPress).toHaveBeenCalledWith("pub-1");
  });

  it("renders the commerce address", () => {
    const { getByText } = render(
      <ConsumerPublicationCard publication={buildPub()} />,
    );
    expect(getByText("Av. Corrientes 1234")).toBeTruthy();
  });

  it("renders distance when distance_km is provided", () => {
    const { getByText } = render(
      <ConsumerPublicationCard
        publication={buildPub({ distance_km: 2.5 })}
      />,
    );
    expect(getByText("2.5 km")).toBeTruthy();
  });

  describe("expiry badge", () => {
    const FIXED_NOW = new Date("2026-06-13T12:00:00.000Z");

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(FIXED_NOW);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("shows urgent badge when expiry is within 24 hours", () => {
      const expiry = new Date(FIXED_NOW.getTime() + 2 * 3_600_000).toISOString();
      const { getByText } = render(
        <ConsumerPublicationCard publication={buildPub({ expiry_date: expiry })} />,
      );
      expect(getByText("Vence hoy")).toBeTruthy();
    });

    it("shows warning badge when expiry is between 24 and 48 hours", () => {
      const expiry = new Date(FIXED_NOW.getTime() + 36 * 3_600_000).toISOString();
      const { getByText } = render(
        <ConsumerPublicationCard publication={buildPub({ expiry_date: expiry })} />,
      );
      expect(getByText("Vence mañana")).toBeTruthy();
    });

    it("shows info text (no badge) when expiry is more than 48 hours away", () => {
      const expiry = new Date(FIXED_NOW.getTime() + 7 * 24 * 3_600_000).toISOString();
      const { getByText } = render(
        <ConsumerPublicationCard publication={buildPub({ expiry_date: expiry })} />,
      );
      expect(getByText(/Vence en \d+ días/)).toBeTruthy();
    });
  });
});
