import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import CommerceProfile from "../index";
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
  displayName: "El Comercio SA",
  email: "comercio@example.com",
  initials: "CD",
  photoUrl: null,
  photoFullUrl: null,
  addressShort: undefined,
  unreadCount: 0,
  handleEditProfile: jest.fn(),
  handleAddresses: jest.fn(),
  handleChangePassword: jest.fn(),
  handleNotifications: jest.fn(),
  handleMetrics: jest.fn(),
  handleLogout: jest.fn(),
};

const setup = (overrides = {}) => {
  (useProfileScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("CommerceProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders commerce-specific menu items", () => {
    const { getByText } = render(<CommerceProfile />);
    expect(getByText("Editar Perfil")).toBeTruthy();
    expect(getByText("Mis Direcciones")).toBeTruthy();
    expect(getByText("Cambiar Contraseña")).toBeTruthy();
    expect(getByText("Notificaciones")).toBeTruthy();
    expect(getByText("Mis Métricas")).toBeTruthy();
    expect(getByText("Cerrar sesión")).toBeTruthy();
  });

  it("calls handleMetrics when Mis Métricas is pressed", () => {
    const handleMetrics = jest.fn();
    setup({ handleMetrics });
    const { getByTestId } = render(<CommerceProfile />);
    fireEvent.press(getByTestId("btn-metrics"));
    expect(handleMetrics).toHaveBeenCalledTimes(1);
  });

  it("calls handleLogout when Cerrar sesión is pressed", () => {
    const handleLogout = jest.fn();
    setup({ handleLogout });
    const { getByTestId } = render(<CommerceProfile />);
    fireEvent.press(getByTestId("btn-logout"));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});
