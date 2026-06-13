import React from "react";
import { render } from "@testing-library/react-native";
import OnboardingLayout from "../_layout";

jest.mock("expo-router", () => ({ Stack: () => null }));

describe("OnboardingLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<OnboardingLayout />);
    expect(toJSON()).toBeNull();
  });
});
