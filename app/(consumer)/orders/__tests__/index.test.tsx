import React from "react";
import { render } from "@testing-library/react-native";
import ConsumerOrders from "../index";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe("ConsumerOrders", () => {
  it("renders the heading", () => {
    const { getByText } = render(<ConsumerOrders />);
    expect(getByText("Mis pedidos")).toBeTruthy();
  });

  it("renders the in-construction message", () => {
    const { getByText } = render(<ConsumerOrders />);
    expect(getByText("En construcción")).toBeTruthy();
  });
});
