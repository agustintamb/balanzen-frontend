import { fireEvent, render } from "@testing-library/react-native";
import CategorySelector from "../CategorySelector";

jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

const categories = [
  { id: "cat-1", name: "Verduras" },
  { id: "cat-2", name: "Frutas" },
  { id: "cat-3", name: "Lácteos" },
];

describe("CategorySelector", () => {
  it("renders all categories", () => {
    const { getByText } = render(
      <CategorySelector
        categories={categories}
        selectedId={null}
        onSelect={jest.fn()}
      />,
    );
    expect(getByText("Verduras")).toBeTruthy();
    expect(getByText("Frutas")).toBeTruthy();
    expect(getByText("Lácteos")).toBeTruthy();
  });

  it("calls onSelect with the correct id when a chip is pressed", () => {
    const onSelect = jest.fn();
    const { getByTestId } = render(
      <CategorySelector
        categories={categories}
        selectedId={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByTestId("category-chip-cat-2"));
    expect(onSelect).toHaveBeenCalledWith("cat-2");
  });

  it("renders the selected chip with a distinct label style", () => {
    const { getByTestId } = render(
      <CategorySelector
        categories={categories}
        selectedId="cat-1"
        onSelect={jest.fn()}
      />,
    );
    expect(getByTestId("category-chip-cat-1")).toBeTruthy();
  });

  it("renders unselected chips without selected styling", () => {
    const { getByTestId } = render(
      <CategorySelector
        categories={categories}
        selectedId="cat-1"
        onSelect={jest.fn()}
      />,
    );
    expect(getByTestId("category-chip-cat-2")).toBeTruthy();
  });
});
