import { render } from "@testing-library/react-native";
import StepIndicator from "../StepIndicator";

jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("StepIndicator", () => {
  it("renders both step labels when currentStep is 1", () => {
    const { getByText } = render(<StepIndicator currentStep={1} />);
    expect(getByText("Información")).toBeTruthy();
    expect(getByText("Precio y stock")).toBeTruthy();
  });

  it("renders both step labels when currentStep is 2", () => {
    const { getByText } = render(<StepIndicator currentStep={2} />);
    expect(getByText("Información")).toBeTruthy();
    expect(getByText("Precio y stock")).toBeTruthy();
  });
});
