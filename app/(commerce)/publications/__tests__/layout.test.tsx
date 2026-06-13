import React from "react";
import { render } from "@testing-library/react-native";
import PublicationsLayout from "../_layout";

jest.mock("expo-router", () => ({ Stack: () => null }));

describe("PublicationsLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<PublicationsLayout />);
    expect(toJSON()).toBeNull();
  });
});
