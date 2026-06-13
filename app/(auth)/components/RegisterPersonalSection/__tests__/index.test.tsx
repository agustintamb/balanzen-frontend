import React from "react";
import { render } from "@testing-library/react-native";
import RegisterPersonalSection from "../index";
import { useRegisterPersonalSection } from "../useRegisterPersonalSection";

jest.mock("../useRegisterPersonalSection", () => ({
  useRegisterPersonalSection: jest.fn(),
}));
jest.mock("../../../components/PersonalForm", () => () => null);
jest.mock("@/components/Banner", () => () => null);
jest.mock("@/components/ui/Button", () => {
  function MockButton({ children }: any) {
    const { Text } = require("react-native");
    return <Text>{children}</Text>;
  }
  return MockButton;
});

const BASE_HOOK = {
  control: {},
  trigger: jest.fn(),
  onSubmit: jest.fn(),
  isValid: false,
  isPending: false,
  isConsumidor: true,
};

const setup = (overrides = {}) => {
  (useRegisterPersonalSection as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("RegisterPersonalSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders the heading", () => {
    const { getByText } = render(
      <RegisterPersonalSection
        role="CONSUMIDOR"
        onComercioComplete={jest.fn()}
      />,
    );
    expect(getByText("Tus datos personales")).toBeTruthy();
  });

  it("shows 'Crear cuenta' button for CONSUMIDOR", () => {
    const { getByText } = render(
      <RegisterPersonalSection
        role="CONSUMIDOR"
        onComercioComplete={jest.fn()}
      />,
    );
    expect(getByText("Crear cuenta")).toBeTruthy();
  });

  it("shows 'Continuar' button for COMERCIO", () => {
    setup({ isConsumidor: false });
    const { getByText } = render(
      <RegisterPersonalSection
        role="COMERCIO"
        onComercioComplete={jest.fn()}
      />,
    );
    expect(getByText("Continuar")).toBeTruthy();
  });
});
