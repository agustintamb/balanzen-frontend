import React from "react";
import { render } from "@testing-library/react-native";
import AuthLayout from "../_layout";

jest.mock("expo-router", () => ({
  Stack: () => null,
}));

describe("AuthLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<AuthLayout />);
    expect(toJSON()).toBeNull();
  });
});
