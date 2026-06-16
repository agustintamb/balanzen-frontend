import { act, render } from "@testing-library/react-native";
import PublishSuccess from "../PublishSuccess";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("PublishSuccess", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the success text when visible is true", () => {
    const { getByText } = render(
      <PublishSuccess visible={true} onDone={jest.fn()} />,
    );
    expect(getByText("¡Publicación creada!")).toBeTruthy();
  });

  it("does not show the success text when visible is false", () => {
    const { queryByText } = render(
      <PublishSuccess visible={false} onDone={jest.fn()} />,
    );
    expect(queryByText("¡Publicación creada!")).toBeNull();
  });

  it("calls onDone after 2000ms", () => {
    const onDone = jest.fn();
    render(<PublishSuccess visible={true} onDone={onDone} />);
    expect(onDone).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
