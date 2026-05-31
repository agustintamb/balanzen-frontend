import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ActionSheet, {
  ActionSheetProps,
} from "@/components/ui/ActionSheet/index";

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");

  const Icon = ({ name, testID }: { name: string; testID?: string }) => (
    <View testID={testID ?? `icon-${name}`} />
  );

  return { __esModule: true, default: Icon };
});

jest.mock("@/components/ui/Button", () => {
  const { TouchableOpacity, Text, ActivityIndicator } = require("react-native");

  const Button = ({
    children,
    onPress,
    loading,
    variant,
    testID,
  }: {
    children: React.ReactNode;
    onPress: () => void;
    loading?: boolean;
    variant?: string;
    testID?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      testID={testID ?? "action-sheet-confirm-button"}
      accessibilityLabel={variant}
    >
      {loading ? (
        <ActivityIndicator testID="button-spinner" />
      ) : (
        <Text>{children}</Text>
      )}
    </TouchableOpacity>
  );

  return { __esModule: true, default: Button };
});

// Animated animations complete synchronously in the jest-expo environment.

// ── Helpers ────────────────────────────────────────────────────────────────

const buildProps = (
  overrides: Partial<ActionSheetProps> = {},
): ActionSheetProps => ({
  visible: true,
  title: "Confirmar acción",
  confirmLabel: "Confirmar",
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("ActionSheet", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Visibility ────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("should not render content when visible=false", () => {
      const { queryByText } = render(
        <ActionSheet {...buildProps({ visible: false })} />,
      );

      // shouldRender starts as false — component returns null immediately
      expect(queryByText("Confirmar acción")).toBeNull();
    });

    it("should render content when visible=true", () => {
      const { getByText } = render(
        <ActionSheet {...buildProps({ visible: true })} />,
      );

      expect(getByText("Confirmar acción")).toBeTruthy();
    });
  });

  // ── Title & Message ───────────────────────────────────────────────────

  describe("title and message", () => {
    it("should render the title text when visible", () => {
      const { getByText } = render(
        <ActionSheet {...buildProps({ title: "¿Eliminar publicación?" })} />,
      );

      expect(getByText("¿Eliminar publicación?")).toBeTruthy();
    });

    it("should render the message text when provided and visible", () => {
      const { getByText } = render(
        <ActionSheet
          {...buildProps({ message: "Esta acción no se puede deshacer." })}
        />,
      );

      expect(getByText("Esta acción no se puede deshacer.")).toBeTruthy();
    });

    it("should not render a message element when message is undefined", () => {
      const { queryByText } = render(
        <ActionSheet {...buildProps({ message: undefined })} />,
      );

      expect(queryByText("Esta acción no se puede deshacer.")).toBeNull();
    });

    it("should not render a message element when message is an empty string", () => {
      // Source uses !!message — empty string is falsy, so the block is skipped
      const { UNSAFE_queryAllByType } = render(
        <ActionSheet {...buildProps({ message: "" })} />,
      );

      // There should be exactly one Text node for the title — no extra message node
      const { Text: RNText } = require("react-native");
      const texts = UNSAFE_queryAllByType(RNText);
      const textContents = texts.map(
        (node: { props: { children: unknown } }) => node.props.children,
      );
      expect(textContents).not.toContain("");
    });
  });

  // ── Icon ──────────────────────────────────────────────────────────────

  describe("icon", () => {
    it("should render the icon when iconName is provided", () => {
      const { getByTestId } = render(
        <ActionSheet {...buildProps({ iconName: "trash-2" })} />,
      );

      expect(getByTestId("icon-trash-2")).toBeTruthy();
    });

    it("should not render an icon when iconName is not provided", () => {
      const { queryByTestId } = render(
        <ActionSheet {...buildProps({ iconName: undefined })} />,
      );

      expect(queryByTestId(/^icon-/)).toBeNull();
    });
  });

  // ── Confirm button ────────────────────────────────────────────────────

  describe("confirm button", () => {
    it("should call onConfirm when the confirm button is pressed", () => {
      const onConfirm = jest.fn();
      const { getByTestId } = render(
        <ActionSheet {...buildProps({ onConfirm })} />,
      );

      fireEvent.press(getByTestId("action-sheet-confirm-button"));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("should display the confirmLabel text on the confirm button", () => {
      const { getByText } = render(
        <ActionSheet {...buildProps({ confirmLabel: "Eliminar" })} />,
      );

      expect(getByText("Eliminar")).toBeTruthy();
    });

    it("should show a loading spinner on the confirm button when loading=true", () => {
      const { getByTestId } = render(
        <ActionSheet {...buildProps({ loading: true })} />,
      );

      expect(getByTestId("button-spinner")).toBeTruthy();
    });

    it("should disable the confirm button when loading=true", () => {
      const { getByTestId } = render(
        <ActionSheet {...buildProps({ loading: true })} />,
      );

      const confirmButton = getByTestId("action-sheet-confirm-button");
      // RNTL maps disabled={true} on TouchableOpacity to accessibilityState.disabled
      expect(confirmButton.props.accessibilityState?.disabled).toBe(true);
    });

    it("should not disable the confirm button when loading=false", () => {
      const { getByTestId } = render(
        <ActionSheet {...buildProps({ loading: false })} />,
      );

      const confirmButton = getByTestId("action-sheet-confirm-button");
      expect(confirmButton.props.disabled).toBeFalsy();
    });

    it("should pass confirmVariant='danger' to the Button component", () => {
      const { getByTestId } = render(
        <ActionSheet {...buildProps({ confirmVariant: "danger" })} />,
      );

      // The mock Button exposes the variant prop via accessibilityLabel
      const confirmButton = getByTestId("action-sheet-confirm-button");
      expect(confirmButton.props.accessibilityLabel).toBe("danger");
    });

    it("should pass confirmVariant='primary' to the Button component", () => {
      const { getByTestId } = render(
        <ActionSheet {...buildProps({ confirmVariant: "primary" })} />,
      );

      const confirmButton = getByTestId("action-sheet-confirm-button");
      expect(confirmButton.props.accessibilityLabel).toBe("primary");
    });

    it("should default confirmVariant to 'danger' when not specified", () => {
      const { getByTestId } = render(<ActionSheet {...buildProps()} />);

      const confirmButton = getByTestId("action-sheet-confirm-button");
      expect(confirmButton.props.accessibilityLabel).toBe("danger");
    });
  });

  // ── Cancel button ─────────────────────────────────────────────────────

  describe("cancel button", () => {
    it("should call onCancel when the cancel button is pressed", () => {
      const onCancel = jest.fn();
      const { getByText } = render(
        <ActionSheet {...buildProps({ onCancel, cancelLabel: "Volver" })} />,
      );

      fireEvent.press(getByText("Volver"));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should display the cancelLabel text on the cancel button", () => {
      const { getByText } = render(
        <ActionSheet {...buildProps({ cancelLabel: "No, gracias" })} />,
      );

      expect(getByText("No, gracias")).toBeTruthy();
    });

    it("should display the default cancelLabel 'Volver' when not provided", () => {
      const { getByText } = render(
        <ActionSheet {...buildProps({ cancelLabel: undefined })} />,
      );

      expect(getByText("Volver")).toBeTruthy();
    });

    it("should disable the cancel button when loading=true", () => {
      // The cancel TouchableOpacity receives disabled={loading} from the source
      const { TouchableOpacity } = require("react-native");
      const { UNSAFE_getAllByType } = render(
        <ActionSheet
          {...buildProps({ loading: true, cancelLabel: "Volver" })}
          {...buildProps({ loading: true, cancelLabel: "Volver" })}
        />,
      );
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      // First TouchableOpacity in the buttons row is the cancel button
      const cancelButton = touchables[0];
      expect(cancelButton.props.disabled).toBe(true);
    });
  });

  // ── Backdrop ──────────────────────────────────────────────────────────

  describe("backdrop", () => {
    it("should call onCancel when the backdrop (TouchableWithoutFeedback) is pressed", () => {
      const onCancel = jest.fn();
      const { UNSAFE_getAllByType } = render(
        <ActionSheet {...buildProps({ onCancel })} />,
      );

      // The source wraps the backdrop in a TouchableWithoutFeedback with onPress={onCancel}
      const { TouchableWithoutFeedback } = require("react-native");
      const backdrops = UNSAFE_getAllByType(TouchableWithoutFeedback);
      expect(backdrops.length).toBeGreaterThan(0);

      fireEvent.press(backdrops[0]);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
