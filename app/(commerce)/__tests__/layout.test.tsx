import React from "react";
import { render } from "@testing-library/react-native";
import CommerceLayout from "../_layout";

function MockTabs({ tabBar }: any) {
  if (tabBar) tabBar({});
  return null;
}
(MockTabs as any).Screen = function MockTabsScreen() {
  return null;
};

jest.mock("expo-router", () => ({ Tabs: MockTabs }));
jest.mock("@/components/TabBar", () => () => null);

describe("CommerceLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<CommerceLayout />);
    expect(toJSON()).toBeNull();
  });
});
