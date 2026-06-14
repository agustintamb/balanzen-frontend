import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import FilterChipBar from "@/components/FilterChipBar";

const FILTERS = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "cancelled", label: "Cancelados" },
] as const;

type Key = (typeof FILTERS)[number]["key"];

describe("FilterChipBar", () => {
  it("renders all filter labels", () => {
    const { getByText } = render(
      <FilterChipBar
        filters={FILTERS}
        activeFilter="all"
        onFilterChange={jest.fn()}
      />,
    );
    expect(getByText("Todos")).toBeTruthy();
    expect(getByText("Activos")).toBeTruthy();
    expect(getByText("Cancelados")).toBeTruthy();
  });

  it("calls onFilterChange with the correct key when a chip is pressed", () => {
    const onFilterChange = jest.fn();
    const { getByTestId } = render(
      <FilterChipBar
        filters={FILTERS}
        activeFilter="all"
        onFilterChange={onFilterChange}
      />,
    );
    fireEvent.press(getByTestId("filter-active"));
    expect(onFilterChange).toHaveBeenCalledWith("active");
  });

  it("does not crash when activeFilter matches one of the keys", () => {
    expect(() =>
      render(
        <FilterChipBar
          filters={FILTERS}
          activeFilter={"active" as Key}
          onFilterChange={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it("renders each chip with its testID", () => {
    const { getByTestId } = render(
      <FilterChipBar
        filters={FILTERS}
        activeFilter="all"
        onFilterChange={jest.fn()}
      />,
    );
    expect(getByTestId("filter-all")).toBeTruthy();
    expect(getByTestId("filter-active")).toBeTruthy();
    expect(getByTestId("filter-cancelled")).toBeTruthy();
  });
});
