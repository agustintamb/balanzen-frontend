import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { AddressInput } from "@/api/addresses/addresses.types";
import AddressMap from "../AddressMap";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

jest.mock("../SafeMapView", () => ({
  SafeMapView: "View",
  MAPS_AVAILABLE: false,
}));

const DEFAULT_REGION = {
  latitude: -34.6,
  longitude: -58.4,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const PENDING_ADDRESS: AddressInput = {
  formatted_address: "Av. Corrientes 1234, CABA",
  street: "Av. Corrientes",
  number: "1234",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6,
  lng: -58.4,
};

describe("AddressMap", () => {
  it("renders the confirmation heading", () => {
    const { getByText } = render(
      <AddressMap
        region={DEFAULT_REGION}
        pendingAddress={PENDING_ADDRESS}
        isReverseGeocoding={false}
        isSaving={false}
        onRegionChangeComplete={jest.fn()}
        onConfirm={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByText("Confirmá tu ubicación")).toBeTruthy();
  });

  it("shows the pending address when available", () => {
    const { getByText } = render(
      <AddressMap
        region={DEFAULT_REGION}
        pendingAddress={PENDING_ADDRESS}
        isReverseGeocoding={false}
        isSaving={false}
        onRegionChangeComplete={jest.fn()}
        onConfirm={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByText("Av. Corrientes 1234, CABA")).toBeTruthy();
  });

  it("shows 'Buscando dirección...' while reverse geocoding", () => {
    const { getByText } = render(
      <AddressMap
        region={DEFAULT_REGION}
        pendingAddress={PENDING_ADDRESS}
        isReverseGeocoding
        isSaving={false}
        onRegionChangeComplete={jest.fn()}
        onConfirm={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByText("Buscando dirección...")).toBeTruthy();
  });

  it("renders the Confirmar button", () => {
    const { getByText } = render(
      <AddressMap
        region={DEFAULT_REGION}
        pendingAddress={PENDING_ADDRESS}
        isReverseGeocoding={false}
        isSaving={false}
        onRegionChangeComplete={jest.fn()}
        onConfirm={jest.fn()}
        onBack={jest.fn()}
      />,
    );
    expect(getByText("Confirmar")).toBeTruthy();
  });

  it("calls onConfirm when the Confirmar button is pressed", () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <AddressMap
        region={DEFAULT_REGION}
        pendingAddress={PENDING_ADDRESS}
        isReverseGeocoding={false}
        isSaving={false}
        onRegionChangeComplete={jest.fn()}
        onConfirm={onConfirm}
        onBack={jest.fn()}
      />,
    );
    fireEvent.press(getByText("Confirmar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when the back button is pressed", () => {
    const onBack = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <AddressMap
        region={DEFAULT_REGION}
        pendingAddress={null}
        isReverseGeocoding={false}
        isSaving={false}
        onRegionChangeComplete={jest.fn()}
        onConfirm={jest.fn()}
        onBack={onBack}
      />,
    );
    const { TouchableOpacity } = require("react-native");
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
