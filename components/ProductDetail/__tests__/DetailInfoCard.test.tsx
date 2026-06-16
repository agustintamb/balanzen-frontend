import { render } from "@testing-library/react-native";
import DetailInfoCard from "../DetailInfoCard";

describe("DetailInfoCard", () => {
  it("renders inline and block rows", () => {
    const { getByText } = render(
      <DetailInfoCard
        items={[
          { label: "Comercio", value: "Verdulería" },
          { label: "Dirección", value: "Av. Santa Fe 2150", block: true },
        ]}
      />,
    );
    expect(getByText("Comercio")).toBeTruthy();
    expect(getByText("Verdulería")).toBeTruthy();
    expect(getByText("Dirección")).toBeTruthy();
    expect(getByText("Av. Santa Fe 2150")).toBeTruthy();
  });

  it("renders nothing when there are no items", () => {
    const { toJSON } = render(<DetailInfoCard items={[]} />);
    expect(toJSON()).toBeNull();
  });
});
