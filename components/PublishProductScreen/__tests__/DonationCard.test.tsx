import { fireEvent, render } from "@testing-library/react-native";
import DonationCard from "../DonationCard";

jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("DonationCard", () => {
  it("renders the subtitle text", () => {
    const { getByText } = render(
      <DonationCard value={false} onChange={jest.fn()} />,
    );
    expect(getByText("El producto será gratuito")).toBeTruthy();
  });

  it("shows 💚 when value is true", () => {
    const { getByText } = render(
      <DonationCard value={true} onChange={jest.fn()} />,
    );
    expect(getByText("💚")).toBeTruthy();
  });

  it("shows 🖤 when value is false", () => {
    const { getByText } = render(
      <DonationCard value={false} onChange={jest.fn()} />,
    );
    expect(getByText("🖤")).toBeTruthy();
  });

  it("calls onChange when the switch is toggled", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <DonationCard value={false} onChange={onChange} />,
    );
    fireEvent(getByTestId("donation-switch"), "valueChange", true);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
