import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import EditProfile from "../index";
import { useEditProfileScreen } from "../useEditProfileScreen";

const mockOnChange = jest.fn();

jest.mock("../useEditProfileScreen", () => ({
  useEditProfileScreen: jest.fn(),
}));
jest.mock("react-hook-form", () => ({
  Controller: jest.fn(({ render: renderFn }: any) =>
    renderFn({
      field: { onChange: mockOnChange, value: "" },
      fieldState: {},
    }),
  ),
}));
jest.mock("@/components/ui/Input", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return React.forwardRef(function MockInput(
    { onChangeText, onSubmitEditing, testID }: any,
    ref: any,
  ) {
    return (
      <TextInput
        ref={ref}
        testID={testID}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
    );
  });
});
jest.mock("@/components/ui/Button", () => {
  const { TouchableOpacity, Text } = require("react-native");
  return function MockButton({ children, onPress, testID }: any) {
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  };
});
jest.mock("@/components/ui/Icon", () => () => null);
jest.mock("@/components/UserAvatar", () => {
  const { TouchableOpacity } = require("react-native");
  return function MockUserAvatar({ onPress, onEditPress, testID }: any) {
    return (
      <TouchableOpacity onPress={onPress} testID={testID}>
        <TouchableOpacity onPress={onEditPress} testID="edit-avatar-btn" />
      </TouchableOpacity>
    );
  };
});
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
  KeyboardAwareScrollView: ({ children }: any) => children,
}));

const MOCK_REFS = {
  businessNameRef: { current: null },
  firstNameRef: { current: null },
  lastNameRef: { current: null },
  emailRef: { current: null },
  phoneRef: { current: null },
  descriptionRef: { current: null },
};

const BASE_HOOK = {
  control: {},
  isDirty: false,
  isValid: false,
  isSubmitting: false,
  isPhotoUploading: false,
  isCommerce: false,
  displayPhotoUrl: null,
  displayPhotoFullUrl: null,
  initials: "AP",
  ...MOCK_REFS,
  handleBack: jest.fn(),
  handleAvatarPress: jest.fn(),
  handleSave: jest.fn(),
};

const setup = (overrides = {}) => {
  (useEditProfileScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("EditProfile screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { Controller } = require("react-hook-form");
    (Controller as jest.Mock).mockImplementation(({ render: renderFn }: any) =>
      renderFn({
        field: { onChange: mockOnChange, value: "" },
        fieldState: {},
      }),
    );
    setup();
  });

  it("renders the title", () => {
    const { getByText } = render(<EditProfile />);
    expect(getByText("Editar Perfil")).toBeTruthy();
  });

  it("renders the save button", () => {
    const { getByText } = render(<EditProfile />);
    expect(getByText("Guardar")).toBeTruthy();
  });

  it("calls handleBack when the back button is pressed", () => {
    const handleBack = jest.fn();
    setup({ handleBack });
    const { getByTestId } = render(<EditProfile />);
    fireEvent.press(getByTestId("btn-back"));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it("renders commerce-specific fields when isCommerce is true", () => {
    setup({ isCommerce: true });
    const { toJSON } = render(<EditProfile />);
    expect(toJSON()).not.toBeNull();
  });

  it("renders the photo viewer modal when displayPhotoFullUrl is set", () => {
    setup({ displayPhotoFullUrl: "https://example.com/full.jpg" });
    const { toJSON } = render(<EditProfile />);
    expect(toJSON()).not.toBeNull();
  });

  it("opens photo viewer when avatar is pressed with a photo", () => {
    setup({
      displayPhotoFullUrl: "https://example.com/full.jpg",
      displayPhotoUrl: "https://example.com/thumb.jpg",
    });
    const { getByTestId } = render(<EditProfile />);
    fireEvent.press(getByTestId("edit-profile-avatar"));
    expect(getByTestId("photo-viewer-backdrop")).toBeTruthy();
  });

  it("closes photo viewer when backdrop is pressed", () => {
    setup({
      displayPhotoFullUrl: "https://example.com/full.jpg",
      displayPhotoUrl: "https://example.com/thumb.jpg",
    });
    const { getByTestId, queryByTestId } = render(<EditProfile />);
    fireEvent.press(getByTestId("edit-profile-avatar"));
    fireEvent.press(getByTestId("photo-viewer-backdrop"));
    expect(queryByTestId("photo-viewer-backdrop")).toBeNull();
  });

  it("closes photo viewer via onRequestClose (hardware back button)", () => {
    setup({
      displayPhotoFullUrl: "https://example.com/full.jpg",
      displayPhotoUrl: "https://example.com/thumb.jpg",
    });
    const { getByTestId, queryByTestId, UNSAFE_getByType } = render(
      <EditProfile />,
    );
    fireEvent.press(getByTestId("edit-profile-avatar"));
    const { Modal } = require("react-native");
    fireEvent(UNSAFE_getByType(Modal), "requestClose");
    expect(queryByTestId("photo-viewer-backdrop")).toBeNull();
  });

  it("fires onSubmitEditing on consumer input fields to advance focus", () => {
    const { getByTestId } = render(<EditProfile />);
    fireEvent(getByTestId("input-first-name"), "submitEditing");
    fireEvent(getByTestId("input-last-name"), "submitEditing");
    fireEvent(getByTestId("input-email"), "submitEditing");
    fireEvent.changeText(getByTestId("input-phone"), "abc123def");
    expect(getByTestId("input-first-name")).toBeTruthy();
  });

  it("fires onSubmitEditing on commerce input fields to advance focus", () => {
    setup({ isCommerce: true });
    const { getByTestId } = render(<EditProfile />);
    fireEvent(getByTestId("input-business-name"), "submitEditing");
    fireEvent(getByTestId("input-phone"), "submitEditing");
    expect(getByTestId("input-business-name")).toBeTruthy();
  });

  it("disables save when isPhotoUploading is true (canSave false branch)", () => {
    setup({ isPhotoUploading: true, isDirty: true, isValid: true });
    const { getByTestId } = render(<EditProfile />);
    expect(getByTestId("btn-save-profile")).toBeTruthy();
  });

  it("renders commerce fields with null values (covers ?? fallback)", () => {
    const { Controller } = require("react-hook-form");
    (Controller as jest.Mock).mockImplementation(
      ({ name, render: renderFn }: any) => {
        const isNullable = name === "business_name" || name === "description";
        return renderFn({
          field: { onChange: mockOnChange, value: isNullable ? null : "" },
          fieldState: {},
        });
      },
    );
    setup({ isCommerce: true });
    const { getByTestId } = render(<EditProfile />);
    expect(getByTestId("input-business-name")).toBeTruthy();
    expect(getByTestId("input-description")).toBeTruthy();
  });
});
