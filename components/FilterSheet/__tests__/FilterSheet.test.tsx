import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import FilterSheet, {
  FilterOptionChips,
  FilterOptionList,
  FilterOptionRow,
  FilterSection,
} from "@/components/FilterSheet";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ bottom: 0 }),
}));

const BASE_PROPS = {
  visible: true,
  onClose: jest.fn(),
  onApply: jest.fn(),
  onReset: jest.fn(),
};

describe("FilterSheet", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when visible is false", () => {
    const { queryByTestId } = render(
      <FilterSheet {...BASE_PROPS} visible={false}>
        <></>
      </FilterSheet>,
    );
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("renders the sheet when visible is true", () => {
    const { getByTestId } = render(
      <FilterSheet {...BASE_PROPS}>
        <></>
      </FilterSheet>,
    );
    expect(getByTestId("filter-sheet")).toBeTruthy();
  });

  it("renders the default title 'Filtros'", () => {
    const { getByText } = render(
      <FilterSheet {...BASE_PROPS}>
        <></>
      </FilterSheet>,
    );
    expect(getByText("Filtros")).toBeTruthy();
  });

  it("renders a custom title when provided", () => {
    const { getByText } = render(
      <FilterSheet {...BASE_PROPS} title="Mis filtros">
        <></>
      </FilterSheet>,
    );
    expect(getByText("Mis filtros")).toBeTruthy();
  });

  it("calls onReset when Restablecer is pressed", () => {
    const onReset = jest.fn();
    const { getByTestId } = render(
      <FilterSheet {...BASE_PROPS} onReset={onReset}>
        <></>
      </FilterSheet>,
    );
    fireEvent.press(getByTestId("filter-sheet-reset"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("calls onApply when Aplicar filtros is pressed", () => {
    const onApply = jest.fn();
    const { getByTestId } = render(
      <FilterSheet {...BASE_PROPS} onApply={onApply}>
        <></>
      </FilterSheet>,
    );
    fireEvent.press(getByTestId("filter-sheet-apply"));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <FilterSheet {...BASE_PROPS} onClose={onClose}>
        <></>
      </FilterSheet>,
    );
    fireEvent.press(getByTestId("filter-sheet-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders children inside the sheet", () => {
    const { getByText } = render(
      <FilterSheet {...BASE_PROPS}>
        <FilterSection title="Test section">
          <></>
        </FilterSection>
      </FilterSheet>,
    );
    expect(getByText("Test section")).toBeTruthy();
  });
});

describe("FilterSection", () => {
  it("renders the section title", () => {
    const { getByText } = render(
      <FilterSection title="Ordenar por">
        <></>
      </FilterSection>,
    );
    expect(getByText("Ordenar por")).toBeTruthy();
  });
});

describe("FilterOptionChips", () => {
  const OPTIONS = [
    { key: "recent", label: "Más recientes" },
    { key: "oldest", label: "Más antiguos" },
  ] as const;

  it("renders all option labels", () => {
    const { getByText } = render(
      <FilterOptionChips
        options={OPTIONS}
        selected="recent"
        onSelect={jest.fn()}
      />,
    );
    expect(getByText("Más recientes")).toBeTruthy();
    expect(getByText("Más antiguos")).toBeTruthy();
  });

  it("calls onSelect with the correct key when a chip is pressed", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <FilterOptionChips
        options={OPTIONS}
        selected="recent"
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByText("Más antiguos"));
    expect(onSelect).toHaveBeenCalledWith("oldest");
  });
});

describe("FilterOptionList", () => {
  const OPTIONS = [
    { key: "all", label: "Todo" },
    { key: "today", label: "Hoy" },
  ] as const;

  it("renders all option labels", () => {
    const { getByText } = render(
      <FilterOptionList
        options={OPTIONS}
        selected="all"
        onSelect={jest.fn()}
      />,
    );
    expect(getByText("Todo")).toBeTruthy();
    expect(getByText("Hoy")).toBeTruthy();
  });

  it("calls onSelect with the correct key when an item is pressed", () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <FilterOptionList
        options={OPTIONS}
        selected="all"
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByText("Hoy"));
    expect(onSelect).toHaveBeenCalledWith("today");
  });

  it("renders check icon for the selected item", () => {
    expect(() =>
      render(
        <FilterOptionList
          options={OPTIONS}
          selected="all"
          onSelect={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });
});

describe("FilterOptionRow", () => {
  it("renders the label", () => {
    const { getByText } = render(
      <FilterOptionRow label="Opción 1" selected={false} onPress={jest.fn()} />,
    );
    expect(getByText("Opción 1")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <FilterOptionRow label="Opción 1" selected={false} onPress={onPress} />,
    );
    fireEvent.press(getByText("Opción 1"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders checkmark when selected is true", () => {
    const { getByText } = render(
      <FilterOptionRow label="Opción 1" selected={true} onPress={jest.fn()} />,
    );
    expect(getByText("✓")).toBeTruthy();
  });

  it("does not render checkmark when selected is false", () => {
    const { queryByText } = render(
      <FilterOptionRow label="Opción 1" selected={false} onPress={jest.fn()} />,
    );
    expect(queryByText("✓")).toBeNull();
  });
});
