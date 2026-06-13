import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { AddressInput } from "@/api/addresses/addresses.types";
import AddressSearch from "../AddressSearch";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

const buildResult = (label: string): AddressInput => ({
  formatted_address: label,
  street: "Calle",
  number: "1",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6,
  lng: -58.4,
});

const defaultProps = {
  searchQuery: "",
  onSearchChange: jest.fn(),
  searchResults: [],
  isSearching: false,
  isGettingLocation: false,
  permissionDenied: false,
  locationError: null,
  onSelectResult: jest.fn(),
  onUseLocation: jest.fn(),
};

describe("AddressSearch", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the heading text", () => {
    const { getByText } = render(<AddressSearch {...defaultProps} />);
    expect(getByText("Ingresá tu dirección")).toBeTruthy();
  });

  it("renders the GPS location button", () => {
    const { getByText } = render(<AddressSearch {...defaultProps} />);
    expect(getByText("Mi ubicación actual")).toBeTruthy();
  });

  it("does not render the back button when onBack is not provided", () => {
    const { UNSAFE_getAllByType } = render(<AddressSearch {...defaultProps} />);
    const { TouchableOpacity } = require("react-native");
    // Only the GPS TouchableOpacity should be present
    expect(UNSAFE_getAllByType(TouchableOpacity).length).toBe(1);
  });

  it("renders the back button when onBack is provided", () => {
    const { UNSAFE_getAllByType } = render(
      <AddressSearch {...defaultProps} onBack={jest.fn()} />,
    );
    const { TouchableOpacity } = require("react-native");
    expect(UNSAFE_getAllByType(TouchableOpacity).length).toBeGreaterThan(1);
  });

  it("calls onBack when the back button is pressed", () => {
    const onBack = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <AddressSearch {...defaultProps} onBack={onBack} />,
    );
    const { TouchableOpacity } = require("react-native");
    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onUseLocation when the GPS button is pressed", () => {
    const onUseLocation = jest.fn();
    const { getByText } = render(
      <AddressSearch {...defaultProps} onUseLocation={onUseLocation} />,
    );
    fireEvent.press(getByText("Mi ubicación actual"));
    expect(onUseLocation).toHaveBeenCalledTimes(1);
  });

  it("shows the permission denied warning when permissionDenied is true", () => {
    const { getByText } = render(
      <AddressSearch {...defaultProps} permissionDenied />,
    );
    expect(getByText(/habilitá el permiso/)).toBeTruthy();
  });

  it("shows the location error when provided and permissionDenied is false", () => {
    const { getByText } = render(
      <AddressSearch
        {...defaultProps}
        locationError="No se pudo obtener tu ubicación"
      />,
    );
    expect(getByText("No se pudo obtener tu ubicación")).toBeTruthy();
  });

  it("does not show location error when permissionDenied is true", () => {
    const { queryByText } = render(
      <AddressSearch
        {...defaultProps}
        permissionDenied
        locationError="Error"
      />,
    );
    expect(queryByText("Error")).toBeNull();
  });

  it("shows search results when query is at least 3 chars and results exist", () => {
    const results = [buildResult("Av. Corrientes 1234")];
    const { getByText } = render(
      <AddressSearch
        {...defaultProps}
        searchQuery="Av."
        searchResults={results}
      />,
    );
    expect(getByText("Av. Corrientes 1234")).toBeTruthy();
  });

  it("calls onSelectResult when a search result is pressed", () => {
    const onSelectResult = jest.fn();
    const result = buildResult("Av. Corrientes 1234");
    const { getByText } = render(
      <AddressSearch
        {...defaultProps}
        searchQuery="Av."
        searchResults={[result]}
        onSelectResult={onSelectResult}
      />,
    );
    fireEvent.press(getByText("Av. Corrientes 1234"));
    expect(onSelectResult).toHaveBeenCalledWith(result);
  });

  it("hides results dropdown when query is shorter than 3 chars", () => {
    const results = [buildResult("Av. Corrientes 1234")];
    const { queryByText } = render(
      <AddressSearch
        {...defaultProps}
        searchQuery="Av"
        searchResults={results}
      />,
    );
    expect(queryByText("Av. Corrientes 1234")).toBeNull();
  });

  it("shows a loading spinner when isSearching is true and query is long enough", () => {
    const { UNSAFE_getByType } = render(
      <AddressSearch {...defaultProps} searchQuery="Av." isSearching />,
    );
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("renders multiple search results with separators between them", () => {
    const results = [
      buildResult("Av. Corrientes 1234"),
      buildResult("Av. Cabildo 2345"),
    ];
    const { getAllByText } = render(
      <AddressSearch
        {...defaultProps}
        searchQuery="Av."
        searchResults={results}
      />,
    );
    expect(getAllByText(/Av\./)).toHaveLength(2);
  });

  it("hides 'Mi ubicación actual' text when isGettingLocation is true", () => {
    const { queryByText } = render(
      <AddressSearch {...defaultProps} isGettingLocation />,
    );
    expect(queryByText("Mi ubicación actual")).toBeNull();
  });
});
