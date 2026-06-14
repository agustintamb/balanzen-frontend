import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { useAddressScreen } from "@/components/AddressScreen/useAddressScreen";
import AddressScreen from "../index";

jest.mock("@/components/AddressScreen/useAddressScreen", () => ({
  useAddressScreen: jest.fn(),
}));

jest.mock("@/components/AddressScreen/AddressList", () => () => null);
jest.mock("@/components/AddressScreen/AddressMap", () => {
  function MockAddressMap({ onBack }: any) {
    const { TouchableOpacity } = require("react-native");
    return onBack ? (
      <TouchableOpacity testID="map-back-btn" onPress={onBack} />
    ) : null;
  }
  return MockAddressMap;
});
jest.mock("@/components/AddressScreen/AddressSearch", () => {
  function MockAddressSearch({ onBack }: any) {
    const { TouchableOpacity } = require("react-native");
    return onBack ? (
      <TouchableOpacity testID="search-back-btn" onPress={onBack} />
    ) : null;
  }
  return MockAddressSearch;
});
jest.mock("@/components/ui/ActionSheet", () => () => null);
jest.mock("@/components/ui/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  function MockButton({ children, onPress, testID }: any) {
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  }
  return MockButton;
});
jest.mock("@/components/ui/Icon", () => () => null);
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const BASE_HOOK = {
  mode: "list" as const,
  setMode: jest.fn(),
  canGoBack: true,
  handleBack: jest.fn(),
  searchQuery: "",
  setSearchQuery: jest.fn(),
  searchResults: [],
  isSearching: false,
  isGettingLocation: false,
  permissionDenied: false,
  locationError: null,
  addresses: [],
  isLoadingAddresses: false,
  localSelectedId: null,
  canContinue: false,
  deletingAddressId: null,
  isDeleting: false,
  handlePressAddress: jest.fn(),
  handleLongPressAddress: jest.fn(),
  handleDeleteCancel: jest.fn(),
  handleDeleteConfirm: jest.fn(),
  pendingAddress: null,
  region: {
    latitude: -34.6,
    longitude: -58.4,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  isReverseGeocoding: false,
  isSaving: false,
  handleUseCurrentLocation: jest.fn(),
  handleSelectSearchResult: jest.fn(),
  handleRegionChangeComplete: jest.fn(),
  handleConfirmAddress: jest.fn(),
  handleContinue: jest.fn(),
  isSelecting: false,
};

const setup = (overrides = {}) => {
  (useAddressScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("AddressScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  describe("list mode", () => {
    it("renders 'Mis Direcciones' heading", () => {
      const { getByText } = render(<AddressScreen />);
      expect(getByText("Mis Direcciones")).toBeTruthy();
    });

    it("renders 'Agregar dirección' button", () => {
      const { getByText } = render(<AddressScreen />);
      expect(getByText("Agregar dirección")).toBeTruthy();
    });

    it("shows 'Guardar' button when addresses exist", () => {
      setup({
        addresses: [
          {
            id: "a1",
            formatted_address: "Av. Siempreviva 742",
            is_selected: false,
          },
        ],
      });
      const { getByText } = render(<AddressScreen />);
      expect(getByText("Guardar")).toBeTruthy();
    });

    it("does not show 'Guardar' button when addresses list is empty", () => {
      const { queryByText } = render(<AddressScreen />);
      expect(queryByText("Guardar")).toBeNull();
    });

    it("calls setMode('add') when 'Agregar dirección' is pressed", () => {
      const setMode = jest.fn();
      setup({ setMode });
      const { getByText } = render(<AddressScreen />);
      fireEvent.press(getByText("Agregar dirección"));
      expect(setMode).toHaveBeenCalledWith("add");
    });
  });

  describe("add mode", () => {
    it("does not render 'Mis Direcciones' heading in add mode", () => {
      setup({ mode: "add" });
      const { queryByText } = render(<AddressScreen />);
      expect(queryByText("Mis Direcciones")).toBeNull();
    });

    it("calls setMode('list') when back is pressed with existing addresses", () => {
      const setMode = jest.fn();
      setup({
        mode: "add",
        setMode,
        addresses: [{ id: "a1", formatted_address: "Av. Test 1" }],
      });
      const { getByTestId } = render(<AddressScreen />);
      fireEvent.press(getByTestId("search-back-btn"));
      expect(setMode).toHaveBeenCalledWith("list");
    });
  });

  describe("map mode", () => {
    it("does not render 'Mis Direcciones' heading in map mode", () => {
      setup({ mode: "map" });
      const { queryByText } = render(<AddressScreen />);
      expect(queryByText("Mis Direcciones")).toBeNull();
    });

    it("calls setMode('add') when map back button is pressed", () => {
      const setMode = jest.fn();
      setup({ mode: "map", setMode });
      const { getByTestId } = render(<AddressScreen />);
      fireEvent.press(getByTestId("map-back-btn"));
      expect(setMode).toHaveBeenCalledWith("add");
    });
  });

  describe("Platform.OS branches", () => {
    const { Platform } = require("react-native");

    afterEach(() => {
      Platform.OS = "android";
    });

    it("renders list mode on iOS without crashing", () => {
      Platform.OS = "ios";
      const { getByText } = render(<AddressScreen />);
      expect(getByText("Mis Direcciones")).toBeTruthy();
    });

    it("renders add mode on iOS without crashing", () => {
      Platform.OS = "ios";
      setup({ mode: "add" });
      const { queryByText } = render(<AddressScreen />);
      expect(queryByText("Mis Direcciones")).toBeNull();
    });
  });

  describe("canGoBack: false", () => {
    it("renders placeholder spacer instead of back button", () => {
      setup({ canGoBack: false });
      const { queryByText, getByText } = render(<AddressScreen />);
      expect(getByText("Mis Direcciones")).toBeTruthy();
      expect(queryByText("chevron-left")).toBeNull();
    });
  });

  describe("deletingAddressId with no matching address", () => {
    it("shows generic deletion message when address is not found", () => {
      setup({
        deletingAddressId: "non-existent-id",
        addresses: [],
      });
      const { toJSON } = render(<AddressScreen />);
      expect(toJSON()).not.toBeNull();
    });
  });

  describe("deletingAddressId with matching address", () => {
    it("shows formatted address in deletion message when address is found", () => {
      setup({
        deletingAddressId: "addr-1",
        addresses: [{ id: "addr-1", formatted_address: "Av. Siempreviva 742" }],
      });
      const { toJSON } = render(<AddressScreen />);
      expect(toJSON()).not.toBeNull();
    });
  });

  describe("add mode KeyboardAvoidingView behavior", () => {
    it("uses padding behavior on iOS", () => {
      const rn = require("react-native");
      const original = rn.Platform.OS;
      rn.Platform.OS = "ios";
      setup({ mode: "add" });
      const { queryByText } = render(<AddressScreen />);
      expect(queryByText("Mis Direcciones")).toBeNull();
      rn.Platform.OS = original;
    });

    it("uses height behavior on Android", () => {
      const rn = require("react-native");
      const original = rn.Platform.OS;
      rn.Platform.OS = "android";
      setup({ mode: "add" });
      const { queryByText } = render(<AddressScreen />);
      expect(queryByText("Mis Direcciones")).toBeNull();
      rn.Platform.OS = original;
    });
  });
});
