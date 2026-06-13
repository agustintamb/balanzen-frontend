import React from "react";
import { render } from "@testing-library/react-native";
import OrdersLayout from "../_layout";

jest.mock("expo-router", () => ({ Stack: () => null }));

describe("OrdersLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<OrdersLayout />);
    expect(toJSON()).toBeNull();
  });
});
