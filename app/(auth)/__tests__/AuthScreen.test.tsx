import React from "react";
import { render } from "@testing-library/react-native";
import AuthScreen from "../index";
import { useAuthScreen } from "../useAuthScreen";

jest.mock("../useAuthScreen", () => ({ useAuthScreen: jest.fn() }));
jest.mock("../components/LoginSection", () => () => null);
jest.mock("../components/RegisterRoleSection", () => () => null);
jest.mock("../components/RegisterPersonalSection", () => () => null);
jest.mock("../components/RegisterCommerceSection", () => () => null);
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
}));

const BASE_HOOK = {
  mode: "login" as const,
  selectedRole: null,
  handleRoleContinue: jest.fn(),
  handlePersonalContinue: jest.fn(),
  handleGoToLogin: jest.fn(),
  handleGoToRegister: jest.fn(),
};

const setup = (overrides = {}) => {
  (useAuthScreen as jest.Mock).mockReturnValue({ ...BASE_HOOK, ...overrides });
};

describe("AuthScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders login mode without crashing", () => {
    const { toJSON } = render(<AuthScreen />);
    expect(toJSON()).toBeNull();
  });

  it("renders register-role mode without crashing", () => {
    setup({ mode: "register-role" });
    const { toJSON } = render(<AuthScreen />);
    expect(toJSON()).toBeNull();
  });

  it("renders register-personal mode when role is selected", () => {
    setup({ mode: "register-personal", selectedRole: "CONSUMIDOR" });
    const { toJSON } = render(<AuthScreen />);
    expect(toJSON()).toBeNull();
  });

  it("renders register-commerce mode without crashing", () => {
    setup({ mode: "register-commerce" });
    const { toJSON } = render(<AuthScreen />);
    expect(toJSON()).toBeNull();
  });
});
