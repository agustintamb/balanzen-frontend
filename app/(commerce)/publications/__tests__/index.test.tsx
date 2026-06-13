import React from "react";
import { render } from "@testing-library/react-native";
import CommercePublications from "../index";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe("CommercePublications", () => {
  it("renders the heading", () => {
    const { getByText } = render(<CommercePublications />);
    expect(getByText("Publicar")).toBeTruthy();
  });

  it("renders the in-construction message", () => {
    const { getByText } = render(<CommercePublications />);
    expect(getByText("En construcción")).toBeTruthy();
  });
});
