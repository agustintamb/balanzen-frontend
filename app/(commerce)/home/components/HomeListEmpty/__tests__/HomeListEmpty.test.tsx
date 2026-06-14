import React from "react";
import { render } from "@testing-library/react-native";
import HomeListEmpty from "@/app/(commerce)/home/components/HomeListEmpty";

describe("HomeListEmpty", () => {
  it("renders message for ACTIVE filter", () => {
    const { getByText } = render(<HomeListEmpty filter="ACTIVE" />);
    expect(getByText("No tenés publicaciones activas.")).toBeTruthy();
  });

  it("renders message for RESERVED filter", () => {
    const { getByText } = render(<HomeListEmpty filter="RESERVED" />);
    expect(getByText("No tenés publicaciones reservadas.")).toBeTruthy();
  });

  it("renders message for DELIVERED filter", () => {
    const { getByText } = render(<HomeListEmpty filter="DELIVERED" />);
    expect(getByText("No tenés publicaciones entregadas.")).toBeTruthy();
  });

  it("renders message for CANCELLED filter", () => {
    const { getByText } = render(<HomeListEmpty filter="CANCELLED" />);
    expect(getByText("No tenés publicaciones canceladas ni vencidas.")).toBeTruthy();
  });

  it("renders message for EXPIRED filter", () => {
    const { getByText } = render(<HomeListEmpty filter="EXPIRED" />);
    expect(getByText("No tenés publicaciones vencidas.")).toBeTruthy();
  });

  it("renders message for ALL filter", () => {
    const { getByText } = render(<HomeListEmpty filter="ALL" />);
    expect(getByText("Todavía no tenés publicaciones.")).toBeTruthy();
  });
});
