import React from "react";
import { render } from "@testing-library/react-native";
import RootLayout from "../_layout";

jest.mock("@/global.css", () => ({}));
jest.mock(
  "@/assets/fonts/TAN-Meringue-Font/TAN MERINGUE.ttf",
  () => "TanMeringue",
);

// All factories are self-contained: _layout.tsx executes module-level side effects
// (colorScheme.set, SystemUI.setBackgroundColorAsync, SplashScreen.preventAutoHideAsync)
// at import time, before any external const is declared.
jest.mock("nativewind", () => ({
  colorScheme: { set: jest.fn() },
}));
jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("expo-router", () => ({
  SplashScreen: {
    preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
    hideAsync: jest.fn().mockResolvedValue(undefined),
  },
  Stack: () => null,
}));
jest.mock("expo-font", () => ({
  useFonts: jest.fn(),
}));
jest.mock("expo-navigation-bar", () => ({
  setButtonStyleAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("@expo-google-fonts/inter", () => ({
  Inter_400Regular: "Inter_400Regular",
  Inter_500Medium: "Inter_500Medium",
  Inter_600SemiBold: "Inter_600SemiBold",
  Inter_700Bold: "Inter_700Bold",
}));
jest.mock("@react-navigation/native", () => ({
  DefaultTheme: { colors: { background: "#fff", border: "#ccc" } },
  ThemeProvider: ({ children }: any) => children,
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardProvider: ({ children }: any) => children,
}));
jest.mock("@/components/SplashOverlay", () => () => null);
jest.mock("@/components/ui/Toast", () => () => null);
jest.mock(
  "@/providers/QueryProvider",
  () =>
    ({ children }: any) =>
      children,
);
jest.mock("@/providers/AuthProvider", () => {
  const { View } = require("react-native");
  return function MockAuthProvider({ children }: any) {
    return <View testID="root-layout">{children}</View>;
  };
});

const { useFonts } = require("expo-font");
const { SplashScreen } = require("expo-router");
const NavigationBar = require("expo-navigation-bar");

describe("RootLayout (_layout.tsx)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing when fonts are not loaded", () => {
    (useFonts as jest.Mock).mockReturnValue([false]);
    const { getByTestId } = render(<RootLayout />);
    expect(getByTestId("root-layout")).toBeTruthy();
  });

  it("does not hide splash screen while fonts are loading", () => {
    (useFonts as jest.Mock).mockReturnValue([false]);
    render(<RootLayout />);
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it("hides splash screen once fonts are loaded", () => {
    (useFonts as jest.Mock).mockReturnValue([true]);
    render(<RootLayout />);
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
  });

  it("sets navigation bar button style on Android", () => {
    const { Platform } = require("react-native");
    const original = Platform.OS;
    Platform.OS = "android";
    (useFonts as jest.Mock).mockReturnValue([false]);
    render(<RootLayout />);
    expect(NavigationBar.setButtonStyleAsync).toHaveBeenCalledWith("dark");
    Platform.OS = original;
  });

  it("does not set navigation bar button style on iOS", () => {
    const { Platform } = require("react-native");
    const original = Platform.OS;
    Platform.OS = "ios";
    (useFonts as jest.Mock).mockReturnValue([false]);
    render(<RootLayout />);
    expect(NavigationBar.setButtonStyleAsync).not.toHaveBeenCalled();
    Platform.OS = original;
  });
});
