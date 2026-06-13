import React from "react";
import { render } from "@testing-library/react-native";
import ProfileLayout from "../_layout";

jest.mock("expo-router", () => ({ Stack: () => null }));

describe("CommerceProfileLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<ProfileLayout />);
    expect(toJSON()).toBeNull();
  });
});
