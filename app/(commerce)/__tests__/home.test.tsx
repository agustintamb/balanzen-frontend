import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { useAuthStore } from "@/stores/auth.store";
import CommerceHome from "../home";

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));
jest.mock("expo-secure-store", () => ({ deleteItemAsync: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(() => ({ clear: jest.fn() })),
}));
jest.mock("@/api/client", () => ({ setAuthToken: jest.fn() }));
jest.mock("@/components/ui/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  function MockButton({ children, onPress }: any) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  }
  return MockButton;
});
jest.mock("@/stores/auth.store", () => ({ useAuthStore: jest.fn() }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe("CommerceHome", () => {
  it("renders the greeting with user first name", () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { first_name: "Carlos" },
      clear: jest.fn(),
    });
    const { getByText } = render(<CommerceHome />);
    expect(getByText("¡Hola, Carlos!")).toBeTruthy();
  });

  it("renders the in-construction message", () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { first_name: "Carlos" },
      clear: jest.fn(),
    });
    const { getByText } = render(<CommerceHome />);
    expect(getByText("Home del comercio — en construcción")).toBeTruthy();
  });

  it("calls logout handlers when the button is pressed", async () => {
    const clear = jest.fn();
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { first_name: "Carlos" },
      clear,
    });
    const { getByText } = render(<CommerceHome />);
    await act(async () => {
      fireEvent.press(getByText("Cerrar sesión"));
    });
    const SecureStore = require("expo-secure-store");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("access_token");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("refresh_token");
  });
});
