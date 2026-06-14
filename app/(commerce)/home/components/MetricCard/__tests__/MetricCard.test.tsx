import React from "react";
import { render } from "@testing-library/react-native";
import MetricCard from "@/app/(commerce)/home/components/MetricCard";

describe("MetricCard", () => {
  it("renders the value", () => {
    const { getByText } = render(
      <MetricCard icon="shopping-bag" value={5} label="Reservas activas" variant="green" />,
    );
    expect(getByText("5")).toBeTruthy();
  });

  it("renders the label", () => {
    const { getByText } = render(
      <MetricCard icon="shopping-bag" value={5} label="Reservas activas" variant="green" />,
    );
    expect(getByText("Reservas activas")).toBeTruthy();
  });

  it("renders with orange variant without crashing", () => {
    expect(() =>
      render(
        <MetricCard icon="clock" value={2} label="Vencen pronto" variant="orange" />,
      ),
    ).not.toThrow();
  });

  it("renders with value 0", () => {
    const { getByText } = render(
      <MetricCard icon="clock" value={0} label="Sin vencer" variant="green" />,
    );
    expect(getByText("0")).toBeTruthy();
  });
});
