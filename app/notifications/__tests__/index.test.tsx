import React from "react";
import { render } from "@testing-library/react-native";
import NotificationsPage from "../index";

jest.mock("@/components/NotificationsScreen", () => {
  const { View } = require("react-native");
  function MockNotificationsScreen() {
    return <View testID="notifications-screen" />;
  }
  return MockNotificationsScreen;
});

describe("notifications/index re-export", () => {
  it("renders the NotificationsScreen component", () => {
    const { getByTestId } = render(<NotificationsPage />);
    expect(getByTestId("notifications-screen")).toBeTruthy();
  });
});
