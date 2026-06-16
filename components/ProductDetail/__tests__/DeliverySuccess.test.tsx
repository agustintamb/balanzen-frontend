import { render } from "@testing-library/react-native";
import DeliverySuccess from "../DeliverySuccess";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});

describe("DeliverySuccess", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the success text when visible is true", () => {
    const { getByText } = render(
      <DeliverySuccess visible onDone={jest.fn()} />,
    );
    expect(getByText("¡Pedido entregado!")).toBeTruthy();
    expect(getByText("La publicación quedó entregada")).toBeTruthy();
  });

  it("does not show the success text when visible is false", () => {
    const { queryByText } = render(
      <DeliverySuccess visible={false} onDone={jest.fn()} />,
    );
    expect(queryByText("¡Pedido entregado!")).toBeNull();
  });

  it("calls onDone after 2000ms", () => {
    const onDone = jest.fn();
    render(<DeliverySuccess visible onDone={onDone} />);
    expect(onDone).not.toHaveBeenCalled();
    jest.advanceTimersByTime(2000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
