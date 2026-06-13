import React from "react";
import { render } from "@testing-library/react-native";
import MetricCard from "../MetricCard";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

describe("MetricCard", () => {
  it("renders the label", () => {
    const { getByText } = render(
      <MetricCard
        label="Publicaciones activas"
        value={5}
        icon="package"
        color="primary"
      />,
    );
    expect(getByText("Publicaciones activas")).toBeTruthy();
  });

  it("renders a numeric value", () => {
    const { getByText } = render(
      <MetricCard
        label="Entregas"
        value={12}
        icon="check-circle"
        color="primary"
      />,
    );
    expect(getByText("12")).toBeTruthy();
  });

  it("renders a string value", () => {
    const { getByText } = render(
      <MetricCard
        label="Ratio"
        value="98%"
        icon="trending-up"
        color="primary"
      />,
    );
    expect(getByText("98%")).toBeTruthy();
  });
});
