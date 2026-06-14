import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ConsumerHomeHeader from "@/app/(consumer)/home/components/ConsumerHomeHeader";

describe("ConsumerHomeHeader", () => {
  it("shows greeting with first name when provided", () => {
    const { getByText } = render(
      <ConsumerHomeHeader
        firstName="Ana"
        selectedAddress={null}
        unreadCount={0}
        onBellPress={jest.fn()}
      />,
    );
    expect(getByText(/Hola, Ana/)).toBeTruthy();
  });

  it("shows 'BalanZen' when first name is empty", () => {
    const { getByText } = render(
      <ConsumerHomeHeader
        firstName=""
        selectedAddress={null}
        unreadCount={0}
        onBellPress={jest.fn()}
      />,
    );
    expect(getByText("BalanZen")).toBeTruthy();
  });

  it("renders the selected address when provided", () => {
    const { getByText } = render(
      <ConsumerHomeHeader
        firstName="Ana"
        selectedAddress="Av. Corrientes 1234"
        unreadCount={0}
        onBellPress={jest.fn()}
      />,
    );
    expect(getByText("Av. Corrientes 1234")).toBeTruthy();
  });

  it("does not render address row when selectedAddress is null", () => {
    const { queryByText } = render(
      <ConsumerHomeHeader
        firstName="Ana"
        selectedAddress={null}
        unreadCount={0}
        onBellPress={jest.fn()}
      />,
    );
    expect(queryByText("Av. Corrientes 1234")).toBeNull();
  });

  it("calls onBellPress when notification button is pressed", () => {
    const onBellPress = jest.fn();
    const { getByTestId } = render(
      <ConsumerHomeHeader
        firstName="Ana"
        selectedAddress={null}
        unreadCount={0}
        onBellPress={onBellPress}
      />,
    );
    fireEvent.press(getByTestId("btn-notifications"));
    expect(onBellPress).toHaveBeenCalledTimes(1);
  });

  it("renders badge when unreadCount > 0", () => {
    expect(() =>
      render(
        <ConsumerHomeHeader
          firstName="Ana"
          selectedAddress={null}
          unreadCount={5}
          onBellPress={jest.fn()}
        />,
      ),
    ).not.toThrow();
  });
});
