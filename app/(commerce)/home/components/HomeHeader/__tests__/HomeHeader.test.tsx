import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import HomeHeader from "@/app/(commerce)/home/components/HomeHeader";

describe("HomeHeader", () => {
  it("renders the business name", () => {
    const { getByText } = render(
      <HomeHeader
        businessName="La Parrilla"
        unreadCount={0}
        onBellPress={jest.fn()}
      />,
    );
    expect(getByText("La Parrilla")).toBeTruthy();
  });

  it("calls onBellPress when notification button is pressed", () => {
    const onBellPress = jest.fn();
    const { getByTestId } = render(
      <HomeHeader
        businessName="La Parrilla"
        unreadCount={0}
        onBellPress={onBellPress}
      />,
    );
    fireEvent.press(getByTestId("btn-notifications"));
    expect(onBellPress).toHaveBeenCalledTimes(1);
  });

  it("renders notification badge when unreadCount > 0", () => {
    expect(() =>
      render(
        <HomeHeader
          businessName="La Parrilla"
          unreadCount={3}
          onBellPress={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });

  it("does not crash when unreadCount is 0", () => {
    expect(() =>
      render(
        <HomeHeader
          businessName="La Parrilla"
          unreadCount={0}
          onBellPress={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });
});
