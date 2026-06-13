import React from "react";
import { render } from "@testing-library/react-native";
import Banner from "../index";

jest.mock("expo-image", () => ({
  Image: "Image",
}));

describe("Banner", () => {
  it("renders the BalanZen logo text", () => {
    const { getByText } = render(<Banner />);
    expect(getByText("BalanZen")).toBeTruthy();
  });

  it("renders the tagline text", () => {
    const { getByText } = render(<Banner />);
    expect(
      getByText(
        "Reducí el desperdicio alimentario y accedé a productos frescos con descuento.",
      ),
    ).toBeTruthy();
  });
});
