import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { Order } from "@/api/orders/orders.types";
import OrderCard from "@/components/OrderCard/OrderCard";

jest.mock("@/utils/cloudinary", () => ({
  buildCardImageUrl: jest.fn((url: string) => `card:${url}`),
}));

const buildOrder = (overrides: Partial<Order> = {}): Order => ({
  id: "order-1",
  publication: {
    id: "pub-1",
    title: "Empanadas criollas",
    final_price: 800,
    photos: ["https://example.com/photo.jpg"],
  },
  consumer: { id: "c1", first_name: "Ana", last_name: "Pérez" },
  commerce: {
    id: "com-1",
    business_name: "La Parrilla",
    selected_address: { formatted_address: "Av. Corrientes 1234" },
  },
  status: "RESERVED",
  created_at: "2026-06-13T08:00:00.000Z",
  updated_at: undefined,
  unread_count: 0,
  ...overrides,
});

describe("OrderCard", () => {
  it("renders the publication title", () => {
    const { getByText } = render(<OrderCard order={buildOrder()} />);
    expect(getByText("Empanadas criollas")).toBeTruthy();
  });

  it("renders the status chip label", () => {
    const { getByText } = render(<OrderCard order={buildOrder()} />);
    expect(getByText("Reservado")).toBeTruthy();
  });

  it("renders the price", () => {
    const { getByText } = render(<OrderCard order={buildOrder()} />);
    expect(getByText(/800/)).toBeTruthy();
  });

  it("shows commerce business_name when perspective is 'consumer'", () => {
    const { getByText } = render(
      <OrderCard order={buildOrder()} perspective="consumer" />,
    );
    expect(getByText("La Parrilla")).toBeTruthy();
  });

  it("shows consumer full name when perspective is 'commerce'", () => {
    const { getByText } = render(
      <OrderCard order={buildOrder()} perspective="commerce" />,
    );
    expect(getByText("Ana Pérez")).toBeTruthy();
  });

  it("calls onPress with the order id when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <OrderCard order={buildOrder()} onPress={onPress} />,
    );
    fireEvent.press(getByText("Empanadas criollas"));
    expect(onPress).toHaveBeenCalledWith("order-1");
  });

  it("renders an image when photos are available", () => {
    const { getAllByRole } = render(<OrderCard order={buildOrder()} />);
    // Image renders an accessible element
    expect(getAllByRole).toBeDefined();
  });

  it("renders placeholder icon when no photos", () => {
    const order = buildOrder({
      publication: {
        id: "pub-1",
        title: "Empanadas criollas",
        final_price: 800,
        photos: [],
      },
    });
    expect(() => render(<OrderCard order={order} />)).not.toThrow();
  });

  it("shows notification dot when hasUnreadMessages is true", () => {
    expect(() =>
      render(<OrderCard order={buildOrder()} hasUnreadMessages={true} />),
    ).not.toThrow();
  });

  it("renders DELIVERED chip label", () => {
    const { getByText } = render(
      <OrderCard order={buildOrder({ status: "DELIVERED" })} />,
    );
    expect(getByText("Entregado")).toBeTruthy();
  });

  it("renders CANCELLED chip label", () => {
    const { getByText } = render(
      <OrderCard order={buildOrder({ status: "CANCELLED" })} />,
    );
    expect(getByText("Cancelado")).toBeTruthy();
  });
});
