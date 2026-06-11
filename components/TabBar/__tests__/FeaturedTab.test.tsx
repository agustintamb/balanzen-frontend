import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import FeaturedTab from "../FeaturedTab";
import type { TabItemProps } from "../tabBar.utils";

jest.mock("expo-linear-gradient", () => {
  const { View } = require("react-native");
  return {
    LinearGradient: ({ children }: { children: React.ReactNode }) => (
      <View testID="linear-gradient">{children}</View>
    ),
  };
});

jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return {
    Feather: ({ name, testID }: { name: string; testID?: string }) => (
      <View testID={testID ?? `feather-${name}`} />
    ),
  };
});

const buildProps = (overrides: Partial<TabItemProps> = {}): TabItemProps => ({
  config: { label: "Mis pedidos", icon: "package" },
  isFocused: false,
  onPress: jest.fn(),
  testID: "tab-orders",
  ...overrides,
});

describe("FeaturedTab", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the label text", () => {
      // Arrange / Act
      const { getByText } = render(<FeaturedTab {...buildProps()} />);
      // Assert
      expect(getByText("Mis pedidos")).toBeTruthy();
    });

    it("should render the gradient circle", () => {
      // Arrange / Act
      const { getByTestId } = render(<FeaturedTab {...buildProps()} />);
      // Assert
      expect(getByTestId("linear-gradient")).toBeTruthy();
    });

    it("should render the Feather icon inside the gradient", () => {
      // Arrange / Act
      const { getByTestId } = render(<FeaturedTab {...buildProps()} />);
      // Assert
      expect(getByTestId("feather-package")).toBeTruthy();
    });

    it("should render the correct icon for publications tab", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <FeaturedTab
          {...buildProps({ config: { label: "Publicar", icon: "plus" } })}
        />,
      );
      // Assert
      expect(getByTestId("feather-plus")).toBeTruthy();
    });

    it("should forward testID to the Pressable", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <FeaturedTab {...buildProps({ testID: "tab-orders" })} />,
      );
      // Assert
      expect(getByTestId("tab-orders")).toBeTruthy();
    });
  });

  describe("label color", () => {
    it("should apply primary text color when focused", () => {
      // Arrange / Act
      const { getByText } = render(
        <FeaturedTab {...buildProps({ isFocused: true })} />,
      );
      // Assert
      expect(getByText("Mis pedidos").props.className).toContain(
        "text-primary",
      );
    });

    it("should apply gray text color when not focused", () => {
      // Arrange / Act
      const { getByText } = render(
        <FeaturedTab {...buildProps({ isFocused: false })} />,
      );
      // Assert
      expect(getByText("Mis pedidos").props.className).toContain(
        "text-gray-400",
      );
    });
  });

  describe("press interaction", () => {
    it("should call onPress when pressed", () => {
      // Arrange
      const onPress = jest.fn();
      const { getByTestId } = render(
        <FeaturedTab {...buildProps({ onPress, testID: "tab-orders" })} />,
      );
      // Act
      fireEvent.press(getByTestId("tab-orders"));
      // Assert
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("should call onPress each time the tab is pressed", () => {
      // Arrange
      const onPress = jest.fn();
      const { getByTestId } = render(
        <FeaturedTab {...buildProps({ onPress, testID: "tab-orders" })} />,
      );
      // Act
      fireEvent.press(getByTestId("tab-orders"));
      fireEvent.press(getByTestId("tab-orders"));
      // Assert
      expect(onPress).toHaveBeenCalledTimes(2);
    });
  });
});
