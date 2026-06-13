import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { Address } from "@/api/addresses/addresses.types";
import AddressItem from "../AddressItem";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

const buildAddress = (overrides: Partial<Address> = {}): Address => ({
  id: "addr-1",
  formatted_address: "Av. Corrientes 1234, CABA",
  street: "Av. Corrientes",
  number: "1234",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6,
  lng: -58.4,
  is_selected: false,
  ...overrides,
});

describe("AddressItem", () => {
  it("renders the formatted address", () => {
    const { getByText } = render(
      <AddressItem
        address={buildAddress()}
        isSelected={false}
        onPress={jest.fn()}
        onLongPress={jest.fn()}
      />,
    );
    expect(getByText("Av. Corrientes 1234, CABA")).toBeTruthy();
  });

  it("renders the city and province subtitle", () => {
    const { getByText } = render(
      <AddressItem
        address={buildAddress()}
        isSelected={false}
        onPress={jest.fn()}
        onLongPress={jest.fn()}
      />,
    );
    expect(getByText("Buenos Aires, Buenos Aires")).toBeTruthy();
  });

  it("does not render subtitle when city and province are empty", () => {
    const { queryByText } = render(
      <AddressItem
        address={buildAddress({ city: "", province: "" })}
        isSelected={false}
        onPress={jest.fn()}
        onLongPress={jest.fn()}
      />,
    );
    expect(queryByText(", ")).toBeNull();
  });

  it("applies selected styles when isSelected is true", () => {
    const { UNSAFE_getByType } = render(
      <AddressItem
        address={buildAddress()}
        isSelected
        onPress={jest.fn()}
        onLongPress={jest.fn()}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    const touchable = UNSAFE_getByType(TouchableOpacity);
    expect(touchable.props.className).toContain("border-primary");
  });

  it("applies unselected styles when isSelected is false", () => {
    const { UNSAFE_getByType } = render(
      <AddressItem
        address={buildAddress()}
        isSelected={false}
        onPress={jest.fn()}
        onLongPress={jest.fn()}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    const touchable = UNSAFE_getByType(TouchableOpacity);
    expect(touchable.props.className).toContain("border-gray-200");
  });

  it("calls onPress when the item is pressed", () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <AddressItem
        address={buildAddress()}
        isSelected={false}
        onPress={onPress}
        onLongPress={jest.fn()}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onLongPress when the item is long-pressed", () => {
    const onLongPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <AddressItem
        address={buildAddress()}
        isSelected={false}
        onPress={jest.fn()}
        onLongPress={onLongPress}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    fireEvent(UNSAFE_getByType(TouchableOpacity), "longPress");
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
