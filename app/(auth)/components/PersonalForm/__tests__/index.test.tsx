import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import PersonalForm from "../index";

const mockOnChange = jest.fn();

jest.mock("react-hook-form", () => ({
  Controller: ({ render: renderFn }: any) =>
    renderFn({
      field: { onChange: mockOnChange, value: "" },
      fieldState: {},
    }),
}));

jest.mock("@/components/ui/Input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return React.forwardRef(function MockInput(
    { onChangeText, onSubmitEditing, placeholder }: any,
    ref: any,
  ) {
    return (
      <TextInput
        ref={ref}
        testID={placeholder}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
    );
  });
});

describe("PersonalForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    const { toJSON } = render(
      <PersonalForm control={{} as any} trigger={jest.fn() as any} />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it("triggers confirmPassword validation when password changes", () => {
    const trigger = jest.fn();
    const { getByTestId } = render(
      <PersonalForm control={{} as any} trigger={trigger} />,
    );
    fireEvent.changeText(getByTestId("Contraseña"), "NewPass1!");
    expect(trigger).toHaveBeenCalledWith("confirmPassword");
  });

  it("strips non-numeric characters from phone input", () => {
    const { getByTestId } = render(
      <PersonalForm control={{} as any} trigger={jest.fn() as any} />,
    );
    fireEvent.changeText(getByTestId("Teléfono"), "abc123def456");
    expect(mockOnChange).toHaveBeenCalledWith("123456");
  });

  it("strips non-numeric characters from DNI input", () => {
    const { getByTestId } = render(
      <PersonalForm control={{} as any} trigger={jest.fn() as any} />,
    );
    fireEvent.changeText(getByTestId("DNI"), "abc12345678");
    expect(mockOnChange).toHaveBeenCalledWith("12345678");
  });

  it("fires onSubmitEditing callbacks to advance focus between fields", () => {
    const { getByTestId } = render(
      <PersonalForm control={{} as any} trigger={jest.fn() as any} />,
    );
    fireEvent(getByTestId("Nombre"), "submitEditing");
    fireEvent(getByTestId("Apellido"), "submitEditing");
    fireEvent(getByTestId("Correo electrónico"), "submitEditing");
    fireEvent(getByTestId("Contraseña"), "submitEditing");
    fireEvent(getByTestId("Confirmar contraseña"), "submitEditing");
    fireEvent(getByTestId("Teléfono"), "submitEditing");
  });
});
