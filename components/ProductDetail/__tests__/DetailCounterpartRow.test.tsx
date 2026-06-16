import { fireEvent, render } from "@testing-library/react-native";
import DetailCounterpartRow from "../DetailCounterpartRow";

jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/components/UserAvatar", () => {
  const { View } = require("react-native");
  return ({ initials }: any) => <View testID={`avatar-${initials}`} />;
});
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));

describe("DetailCounterpartRow", () => {
  it("renders the title", () => {
    const { getByText } = render(
      <DetailCounterpartRow
        title="Verdulería Natura"
        chatEnabled={false}
      />,
    );
    expect(getByText("Verdulería Natura")).toBeTruthy();
  });

  it("renders subtitle when provided", () => {
    const { getByText } = render(
      <DetailCounterpartRow
        title="Verdulería Natura"
        subtitle="Av. Siempreviva 742"
        chatEnabled={false}
      />,
    );
    expect(getByText("Av. Siempreviva 742")).toBeTruthy();
  });

  it("does not render subtitle when not provided", () => {
    const { queryByText } = render(
      <DetailCounterpartRow title="Verdulería Natura" chatEnabled={false} />,
    );
    expect(queryByText("Av. Siempreviva 742")).toBeNull();
  });

  it("calls onChatPress when chat button is pressed and chatEnabled is true", () => {
    const onChatPress = jest.fn();
    const { getByTestId } = render(
      <DetailCounterpartRow
        title="Verdulería Natura"
        chatEnabled
        onChatPress={onChatPress}
      />,
    );
    fireEvent.press(getByTestId("btn-chat"));
    expect(onChatPress).toHaveBeenCalled();
  });

  it("does not call onChatPress when chatEnabled is false", () => {
    const onChatPress = jest.fn();
    const { getByTestId } = render(
      <DetailCounterpartRow
        title="Verdulería Natura"
        chatEnabled={false}
        onChatPress={onChatPress}
      />,
    );
    fireEvent.press(getByTestId("btn-chat"));
    expect(onChatPress).not.toHaveBeenCalled();
  });

  it("renders UserAvatar when initials is provided", () => {
    const { getByTestId } = render(
      <DetailCounterpartRow
        title="Verdulería Natura"
        initials="VN"
        chatEnabled={false}
      />,
    );
    expect(getByTestId("avatar-VN")).toBeTruthy();
  });

  it("renders leftIcon when initials is undefined and leftIcon is provided", () => {
    const { getByTestId } = render(
      <DetailCounterpartRow
        title="Dirección"
        leftIcon="map-pin"
        chatEnabled={false}
      />,
    );
    expect(getByTestId("icon-map-pin")).toBeTruthy();
  });
});
