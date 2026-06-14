import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import IconButton from "@/components/ui/IconButton";

describe("IconButton", () => {
  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <IconButton iconName="bell" onPress={onPress} testID="icon-btn" />,
    );
    fireEvent.press(getByTestId("icon-btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders without crashing with default props", () => {
    expect(() =>
      render(<IconButton iconName="search" onPress={jest.fn()} />),
    ).not.toThrow();
  });

  it("renders in active state without crashing", () => {
    expect(() =>
      render(
        <IconButton iconName="sliders" onPress={jest.fn()} active={true} />,
      ),
    ).not.toThrow();
  });

  it("renders with custom size without crashing", () => {
    expect(() =>
      render(
        <IconButton iconName="bell" onPress={jest.fn()} size={50} iconSize={24} />,
      ),
    ).not.toThrow();
  });

  it("renders with rotate prop without crashing", () => {
    expect(() =>
      render(
        <IconButton
          iconName="sliders"
          onPress={jest.fn()}
          rotate="-90deg"
        />,
      ),
    ).not.toThrow();
  });

  it("forwards testID to the root TouchableOpacity", () => {
    const { getByTestId } = render(
      <IconButton iconName="bell" onPress={jest.fn()} testID="my-icon-btn" />,
    );
    expect(getByTestId("my-icon-btn")).toBeTruthy();
  });
});
