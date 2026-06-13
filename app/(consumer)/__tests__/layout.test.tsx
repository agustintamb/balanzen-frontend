import React from "react";
import { render } from "@testing-library/react-native";
import ConsumerLayout from "../_layout";

function MockTabs({ tabBar }: any) {
  if (tabBar) tabBar({});
  return null;
}
(MockTabs as any).Screen = function MockTabsScreen() {
  return null;
};

jest.mock("expo-router", () => ({ Tabs: MockTabs }));
jest.mock("@/components/TabBar", () => () => null);

describe("ConsumerLayout", () => {
  it("renders without crashing", () => {
    const { toJSON } = render(<ConsumerLayout />);
    expect(toJSON()).toBeNull();
  });
});
