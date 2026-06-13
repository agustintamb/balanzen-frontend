import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ConsumerProfile from "../index";
import { useProfileScreen } from "../useProfileScreen";

jest.mock("../useProfileScreen", () => ({
  useProfileScreen: jest.fn(),
}));

jest.mock("@/components/ProfileHeader", () => () => null);
jest.mock("@/components/ui/MenuItem", () => {
  const { TouchableOpacity, Text } = require("react-native");
  function MockMenuItem({ children, onPress, testID }: any) {
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  }
  return MockMenuItem;
});
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const BASE_HOOK = {
  displayName: "Ana Pérez",
  email: "ana@example.com",
  initials: "AP",
  photoUrl: null,
  photoFullUrl: null,
  addressShort: undefined,
  unreadCount: 0,
  handleEditProfile: jest.fn(),
  handleAddresses: jest.fn(),
  handleChangePassword: jest.fn(),
  handleFavorites: jest.fn(),
  handleNotifications: jest.fn(),
  handleLogout: jest.fn(),
};

const setup = (overrides = {}) => {
  (useProfileScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("ConsumerProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders menu items", () => {
    const { getByText } = render(<ConsumerProfile />);
    expect(getByText("Editar Perfil")).toBeTruthy();
    expect(getByText("Mis Direcciones")).toBeTruthy();
    expect(getByText("Cambiar Contraseña")).toBeTruthy();
    expect(getByText("Mis Favoritos")).toBeTruthy();
    expect(getByText("Notificaciones")).toBeTruthy();
    expect(getByText("Cerrar sesión")).toBeTruthy();
  });

  it("calls handleEditProfile when Editar Perfil is pressed", () => {
    const handleEditProfile = jest.fn();
    setup({ handleEditProfile });
    const { getByTestId } = render(<ConsumerProfile />);
    fireEvent.press(getByTestId("btn-edit-profile"));
    expect(handleEditProfile).toHaveBeenCalledTimes(1);
  });

  it("calls handleLogout when Cerrar sesión is pressed", () => {
    const handleLogout = jest.fn();
    setup({ handleLogout });
    const { getByTestId } = render(<ConsumerProfile />);
    fireEvent.press(getByTestId("btn-logout"));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("calls handleFavorites when Mis Favoritos is pressed", () => {
    const handleFavorites = jest.fn();
    setup({ handleFavorites });
    const { getByTestId } = render(<ConsumerProfile />);
    fireEvent.press(getByTestId("btn-favorites"));
    expect(handleFavorites).toHaveBeenCalledTimes(1);
  });
});
