import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { Address } from "@/api/addresses/addresses.types";
import AddressList from "../index";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

const buildAddress = (
  id: string,
  overrides: Partial<Address> = {},
): Address => ({
  id,
  formatted_address: `Calle ${id} 100`,
  street: `Calle ${id}`,
  number: "100",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6,
  lng: -58.4,
  is_selected: false,
  ...overrides,
});

describe("AddressList", () => {
  it("shows a loading indicator when isLoading is true", () => {
    const { UNSAFE_getByType } = render(
      <AddressList
        addresses={[]}
        selectedId={null}
        isLoading
        onPressAddress={jest.fn()}
        onLongPressAddress={jest.fn()}
      />,
    );
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("renders nothing when the list is empty and not loading", () => {
    const { toJSON } = render(
      <AddressList
        addresses={[]}
        selectedId={null}
        isLoading={false}
        onPressAddress={jest.fn()}
        onLongPressAddress={jest.fn()}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it("renders an AddressItem for each address", () => {
    const addresses = [buildAddress("1"), buildAddress("2"), buildAddress("3")];
    const { getAllByText } = render(
      <AddressList
        addresses={addresses}
        selectedId={null}
        isLoading={false}
        onPressAddress={jest.fn()}
        onLongPressAddress={jest.fn()}
      />,
    );
    expect(getAllByText(/Calle/).length).toBe(3);
  });

  it("calls onPressAddress with the address id when pressed", () => {
    const onPressAddress = jest.fn();
    const addresses = [buildAddress("1")];
    const { UNSAFE_getAllByType } = render(
      <AddressList
        addresses={addresses}
        selectedId={null}
        isLoading={false}
        onPressAddress={onPressAddress}
        onLongPressAddress={jest.fn()}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(onPressAddress).toHaveBeenCalledWith("1");
  });

  it("calls onLongPressAddress with the address id on long press", () => {
    const onLongPressAddress = jest.fn();
    const addresses = [buildAddress("1")];
    const { UNSAFE_getAllByType } = render(
      <AddressList
        addresses={addresses}
        selectedId={null}
        isLoading={false}
        onPressAddress={jest.fn()}
        onLongPressAddress={onLongPressAddress}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    fireEvent(UNSAFE_getAllByType(TouchableOpacity)[0], "longPress");
    expect(onLongPressAddress).toHaveBeenCalledWith("1");
  });

  it("passes the correct isSelected prop to each item", () => {
    const addresses = [buildAddress("1"), buildAddress("2")];
    const { UNSAFE_getAllByType } = render(
      <AddressList
        addresses={addresses}
        selectedId="1"
        isLoading={false}
        onPressAddress={jest.fn()}
        onLongPressAddress={jest.fn()}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    const items = UNSAFE_getAllByType(TouchableOpacity);
    expect(items[0].props.className).toContain("border-primary");
    expect(items[1].props.className).toContain("border-gray-200");
  });
});
