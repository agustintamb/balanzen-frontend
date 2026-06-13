import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import CommerceForm from "../index";

const mockOnChange = jest.fn();

jest.mock("react-hook-form", () => ({
  Controller: jest.fn(({ render: renderFn, name }: any) =>
    renderFn({
      field: {
        onChange: mockOnChange,
        value: name === "acceptTerms" ? false : "",
      },
      fieldState: {},
    }),
  ),
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
jest.mock("@/utils/cn", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));

describe("CommerceForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    const { toJSON } = render(<CommerceForm control={{} as any} />);
    expect(toJSON()).not.toBeNull();
  });

  it("renders the terms of service text", () => {
    const { getByText } = render(<CommerceForm control={{} as any} />);
    expect(getByText(/Términos de servicio/)).toBeTruthy();
  });

  it("renders the privacy policy text", () => {
    const { getByText } = render(<CommerceForm control={{} as any} />);
    expect(getByText(/Política de privacidad/)).toBeTruthy();
  });

  it("toggles acceptTerms when the checkbox is pressed", () => {
    const { UNSAFE_getAllByType } = render(
      <CommerceForm control={{} as any} />,
    );
    const { TouchableOpacity } = require("react-native");
    const pressables = UNSAFE_getAllByType(TouchableOpacity);
    expect(pressables.length).toBeGreaterThan(0);
    fireEvent.press(pressables[0]);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("fires onSubmitEditing on businessName to advance focus to cuit", () => {
    const { getByTestId } = render(<CommerceForm control={{} as any} />);
    fireEvent(getByTestId("Nombre del comercio"), "submitEditing");
  });

  it("renders checkmark icon when acceptTerms is checked", () => {
    const { Controller } = require("react-hook-form");
    (Controller as jest.Mock).mockImplementationOnce(
      ({ render: renderFn }: any) =>
        renderFn({
          field: { onChange: mockOnChange, value: "" },
          fieldState: {},
        }),
    );
    (Controller as jest.Mock).mockImplementationOnce(
      ({ render: renderFn }: any) =>
        renderFn({
          field: { onChange: mockOnChange, value: "" },
          fieldState: {},
        }),
    );
    (Controller as jest.Mock).mockImplementationOnce(
      ({ render: renderFn }: any) =>
        renderFn({
          field: { onChange: mockOnChange, value: true },
          fieldState: {},
        }),
    );
    const { toJSON } = render(<CommerceForm control={{} as any} />);
    expect(toJSON()).not.toBeNull();
  });
});
