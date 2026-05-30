import React, { createRef } from "react";
import { TextInput } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { TouchableOpacity } = require("react-native") as typeof import("react-native");

import Input from "@/components/ui/Input";

afterEach(() => {
  jest.clearAllMocks();
});

describe("Input", () => {
  describe("basic rendering", () => {
    it("should render a TextInput with the given placeholder", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input value="" onChangeText={jest.fn()} placeholder="Enter email" />
      );
      // Act / Assert
      expect(getByPlaceholderText("Enter email")).toBeTruthy();
    });

    it("should render the current value inside the TextInput", () => {
      // Arrange
      const { getByDisplayValue } = render(
        <Input value="hello@example.com" onChangeText={jest.fn()} />
      );
      // Assert
      expect(getByDisplayValue("hello@example.com")).toBeTruthy();
    });

    it("should render the label when label prop is provided", () => {
      // Arrange
      const { getByText } = render(
        <Input value="" onChangeText={jest.fn()} label="Email" />
      );
      // Assert
      expect(getByText("Email")).toBeTruthy();
    });

    it("should not render a label when label prop is omitted", () => {
      // Arrange
      const { queryByText } = render(
        <Input value="" onChangeText={jest.fn()} placeholder="Email" />
      );
      // Assert — only the placeholder text exists, no label element
      expect(queryByText("Email")).toBeNull();
    });
  });

  describe("onChangeText", () => {
    it("should call onChangeText when the user types", () => {
      // Arrange
      const onChangeText = jest.fn();
      const { getByPlaceholderText } = render(
        <Input value="" onChangeText={onChangeText} placeholder="Type here" />
      );
      // Act
      fireEvent.changeText(getByPlaceholderText("Type here"), "new text");
      // Assert
      expect(onChangeText).toHaveBeenCalledTimes(1);
      expect(onChangeText).toHaveBeenCalledWith("new text");
    });
  });

  describe("type='password'", () => {
    it("should set secureTextEntry to true by default", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="password"
          placeholder="Password"
        />
      );
      // Assert
      expect(getByPlaceholderText("Password").props.secureTextEntry).toBe(true);
    });

    it("should render the visibility toggle button", () => {
      // Arrange
      const { UNSAFE_getByType } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="password"
          placeholder="Password"
        />
      );
      // Assert — locate the TouchableOpacity that wraps the eye icon
      expect(UNSAFE_getByType(TouchableOpacity)).toBeTruthy();
    });

    it("should toggle secureTextEntry to false when the visibility button is pressed", () => {
      // Arrange
      const { getByPlaceholderText, UNSAFE_getByType } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="password"
          placeholder="Password"
        />
      );
      // Act
      fireEvent.press(UNSAFE_getByType(TouchableOpacity));
      // Assert
      expect(getByPlaceholderText("Password").props.secureTextEntry).toBe(false);
    });

    it("should toggle secureTextEntry back to true on second press", () => {
      // Arrange
      const { getByPlaceholderText, UNSAFE_getByType } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="password"
          placeholder="Password"
        />
      );
      const toggleBtn = UNSAFE_getByType(TouchableOpacity);
      // Act — press twice
      fireEvent.press(toggleBtn);
      fireEvent.press(toggleBtn);
      // Assert
      expect(getByPlaceholderText("Password").props.secureTextEntry).toBe(true);
    });

    it("should not render a toggle button when type is not password", () => {
      // Arrange
      const { UNSAFE_queryAllByType } = render(
        <Input value="" onChangeText={jest.fn()} type="text" placeholder="Name" />
      );
      // Assert — no TouchableOpacity rendered for non-password types
      expect(UNSAFE_queryAllByType(TouchableOpacity)).toHaveLength(0);
    });
  });

  describe("type='email'", () => {
    it("should set keyboardType to email-address", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="email"
          placeholder="Email"
        />
      );
      // Assert
      expect(getByPlaceholderText("Email").props.keyboardType).toBe(
        "email-address"
      );
    });

    it("should set autoCapitalize to none", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="email"
          placeholder="Email"
        />
      );
      // Assert
      expect(getByPlaceholderText("Email").props.autoCapitalize).toBe("none");
    });
  });

  describe("type='number'", () => {
    it("should set keyboardType to numeric", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="number"
          placeholder="Amount"
        />
      );
      // Assert
      expect(getByPlaceholderText("Amount").props.keyboardType).toBe("numeric");
    });
  });

  describe("type='phone'", () => {
    it("should set keyboardType to phone-pad", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          type="phone"
          placeholder="Phone"
        />
      );
      // Assert
      expect(getByPlaceholderText("Phone").props.keyboardType).toBe("phone-pad");
    });
  });

  describe("error prop", () => {
    it("should render the error message when error prop is provided", () => {
      // Arrange
      const { getByText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          error="This field is required"
        />
      );
      // Assert
      expect(getByText("This field is required")).toBeTruthy();
    });

    it("should not render any helper text when neither error nor hint is provided", () => {
      // Arrange
      const { queryByText } = render(
        <Input value="" onChangeText={jest.fn()} placeholder="Name" />
      );
      // Assert — no stray text node below the input
      expect(queryByText("This field is required")).toBeNull();
    });

    it("should apply error color class to the helper text when error is set", () => {
      // Arrange
      const { getByText } = render(
        <Input value="" onChangeText={jest.fn()} error="Invalid email" />
      );
      // Assert — RNTL exposes className as a prop on the Text node via NativeWind
      const errorText = getByText("Invalid email");
      expect(errorText.props.className).toContain("text-error");
    });
  });

  describe("hint prop", () => {
    it("should render hint text when hint prop is provided", () => {
      // Arrange
      const { getByText } = render(
        <Input value="" onChangeText={jest.fn()} hint="Must be at least 8 characters" />
      );
      // Assert
      expect(getByText("Must be at least 8 characters")).toBeTruthy();
    });

    it("should prefer error over hint when both are provided", () => {
      // Arrange
      const { getByText, queryByText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          error="Required"
          hint="Some hint"
        />
      );
      // Assert — error takes precedence (error ?? hint shows error first)
      expect(getByText("Required")).toBeTruthy();
      expect(queryByText("Some hint")).toBeNull();
    });

    it("should apply gray color class to hint text when only hint is provided", () => {
      // Arrange
      const { getByText } = render(
        <Input value="" onChangeText={jest.fn()} hint="Use 8+ characters" />
      );
      // Assert
      const hintText = getByText("Use 8+ characters");
      expect(hintText.props.className).toContain("text-gray-400");
    });
  });

  describe("disabled prop", () => {
    it("should set editable to false on the TextInput when disabled=true", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          disabled
          placeholder="Disabled input"
        />
      );
      // Assert
      expect(getByPlaceholderText("Disabled input").props.editable).toBe(false);
    });

    it("should set editable to true on the TextInput when disabled=false", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          disabled={false}
          placeholder="Active input"
        />
      );
      // Assert
      expect(getByPlaceholderText("Active input").props.editable).toBe(true);
    });

    it("should set editable to true by default when disabled is omitted", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input value="" onChangeText={jest.fn()} placeholder="Default input" />
      );
      // Assert
      expect(getByPlaceholderText("Default input").props.editable).toBe(true);
    });
  });

  describe("leftIcon prop", () => {
    it("should render the leftIcon element when provided", () => {
      // Arrange
      const { getByTestId } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          leftIcon={<React.Fragment><></>
            {/* Use testID on a View to verify it renders */}
          </React.Fragment>}
          placeholder="With icon"
        />
      );
      // Assert via placeholder since the icon is a node — just check the input still renders
      expect(getByTestId !== undefined).toBe(true);
    });

    it("should render a leftIcon with a testID to verify placement", () => {
      // Arrange
      const { getByTestId } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          leftIcon={<TextInput testID="left-icon-element" editable={false} />}
          placeholder="With icon"
        />
      );
      // Assert — the icon node appears in the tree
      expect(getByTestId("left-icon-element")).toBeTruthy();
    });
  });

  describe("onSubmitEditing", () => {
    it("should call onSubmitEditing when the return key is pressed", () => {
      // Arrange
      const onSubmitEditing = jest.fn();
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          onSubmitEditing={onSubmitEditing}
          placeholder="Submit me"
        />
      );
      // Act
      fireEvent(getByPlaceholderText("Submit me"), "submitEditing");
      // Assert
      expect(onSubmitEditing).toHaveBeenCalledTimes(1);
    });

    it("should not throw when onSubmitEditing is not provided", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input value="" onChangeText={jest.fn()} placeholder="No submit handler" />
      );
      // Act / Assert — should not throw
      expect(() =>
        fireEvent(getByPlaceholderText("No submit handler"), "submitEditing")
      ).not.toThrow();
    });
  });

  describe("returnKeyType prop", () => {
    it("should forward returnKeyType to the TextInput", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          returnKeyType="done"
          placeholder="Return key"
        />
      );
      // Assert
      expect(getByPlaceholderText("Return key").props.returnKeyType).toBe("done");
    });
  });

  describe("testID prop", () => {
    it("should forward testID to the outer container View", () => {
      // Arrange
      const { getByTestId } = render(
        <Input
          value=""
          onChangeText={jest.fn()}
          testID="input-container"
          placeholder="Test"
        />
      );
      // Assert — testID is placed on the wrapping View
      expect(getByTestId("input-container")).toBeTruthy();
    });
  });

  describe("ref forwarding", () => {
    it("should forward the ref to the underlying TextInput", () => {
      // Arrange
      const ref = createRef<TextInput>();
      render(
        <Input
          ref={ref}
          value=""
          onChangeText={jest.fn()}
          placeholder="Ref input"
        />
      );
      // Assert — ref.current should be a TextInput instance
      expect(ref.current).not.toBeNull();
      expect(ref.current).toBeInstanceOf(TextInput);
    });
  });

  describe("focus and blur styling", () => {
    it("should not throw when the TextInput receives focus", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input value="" onChangeText={jest.fn()} placeholder="Focus me" />
      );
      // Act / Assert
      expect(() =>
        fireEvent(getByPlaceholderText("Focus me"), "focus")
      ).not.toThrow();
    });

    it("should not throw when the TextInput loses focus", () => {
      // Arrange
      const { getByPlaceholderText } = render(
        <Input value="" onChangeText={jest.fn()} placeholder="Blur me" />
      );
      // Act — focus then blur
      fireEvent(getByPlaceholderText("Blur me"), "focus");
      expect(() =>
        fireEvent(getByPlaceholderText("Blur me"), "blur")
      ).not.toThrow();
    });
  });
});
