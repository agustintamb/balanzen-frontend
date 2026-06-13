import React from "react";
import { render } from "@testing-library/react-native";
import ConsumerLayout from "../_layout";

jest.mock("expo-router", () => {
  function MockTabs({ tabBar }: any) {
    if (tabBar) tabBar({});
    return null;
  }
  MockTabs.Screen = function MockTabsScreen() {
    return null;
  };
  return { Tabs: MockTabs };
});
jest.mock("@/components/TabBar", () => () => null);

describe("ConsumerLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<ConsumerLayout />);
    expect(toJSON()).toBeNull();
  });
});
