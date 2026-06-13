import React from "react";
import { render } from "@testing-library/react-native";
import RegisterCommerceSection from "../index";
import { useRegisterCommerceSection } from "../useRegisterCommerceSection";

jest.mock("../useRegisterCommerceSection", () => ({
  useRegisterCommerceSection: jest.fn(),
}));
jest.mock("../../../components/CommerceForm", () => () => null);
jest.mock("@/components/Banner", () => () => null);
jest.mock("@/components/ui/Button", () => {
  function MockButton({ children }: any) {
    const { Text } = require("react-native");
    return <Text>{children}</Text>;
  }
  return MockButton;
});

describe("RegisterCommerceSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRegisterCommerceSection as jest.Mock).mockReturnValue({
      control: {},
      onSubmit: jest.fn(),
      isValid: false,
      isPending: false,
    });
  });

  it("renders the heading", () => {
    const { getByText } = render(<RegisterCommerceSection />);
    expect(getByText("Datos del comercio")).toBeTruthy();
  });

  it("renders the submit button", () => {
    const { getByText } = render(<RegisterCommerceSection />);
    expect(getByText("Crear cuenta")).toBeTruthy();
  });
});
