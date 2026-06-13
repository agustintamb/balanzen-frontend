import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ChangePassword from "../index";
import { useChangePasswordScreen } from "../useChangePasswordScreen";

jest.mock("../useChangePasswordScreen", () => ({
  useChangePasswordScreen: jest.fn(),
}));
jest.mock("react-hook-form", () => ({
  Controller: ({ render: renderFn }: any) =>
    renderFn({
      field: { onChange: jest.fn(), value: "" },
      fieldState: {},
    }),
}));
jest.mock("@/components/ui/Input", () => () => null);
jest.mock("@/components/ui/Button", () => {
  function MockButton({ children, onPress, testID }: any) {
    const { TouchableOpacity, Text } = require("react-native");
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
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
  KeyboardAwareScrollView: ({ children }: any) => children,
}));

const BASE_HOOK = {
  control: {},
  isValid: false,
  isSubmitting: false,
  handleBack: jest.fn(),
  handleSave: jest.fn(),
};

const setup = (overrides = {}) => {
  (useChangePasswordScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("ChangePassword screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders the title", () => {
    const { getByText } = render(<ChangePassword />);
    expect(getByText("Cambiar contraseña")).toBeTruthy();
  });

  it("renders the save button", () => {
    const { getByText } = render(<ChangePassword />);
    expect(getByText("Guardar contraseña")).toBeTruthy();
  });

  it("renders the hint text", () => {
    const { getByText } = render(<ChangePassword />);
    expect(getByText(/al menos 8 caracteres/)).toBeTruthy();
  });

  it("calls handleBack when the back button is pressed", () => {
    const handleBack = jest.fn();
    setup({ handleBack });
    const { getByTestId } = render(<ChangePassword />);
    fireEvent.press(getByTestId("btn-back"));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("calls handleSave when the save button is pressed", () => {
    const handleSave = jest.fn();
    setup({ handleSave, isValid: true });
    const { getByTestId } = render(<ChangePassword />);
    fireEvent.press(getByTestId("btn-save-password"));
    expect(handleSave).toHaveBeenCalledTimes(1);
  });
});
