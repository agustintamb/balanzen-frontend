import React from "react";
import { render } from "@testing-library/react-native";
import HomeLayout from "@/app/(commerce)/home/_layout";

jest.mock("expo-router", () => ({
  Stack: ({ screenOptions }: any) => {
    const { View } = require("react-native");
    return <View testID="stack" />;
  },
}));

describe("Commerce HomeLayout", () => {
  it("renders without crashing", () => {
    expect(() => render(<HomeLayout />)).not.toThrow();
  });

  it("renders the Stack navigator", () => {
    const { getByTestId } = render(<HomeLayout />);
    expect(getByTestId("stack")).toBeTruthy();
  });
});
