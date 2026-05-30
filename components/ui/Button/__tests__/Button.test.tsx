import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import Button from "@/components/ui/Button";

// NativeWind processes className at build-time via Babel; mock it so
// the Babel transform is a no-op and the component renders in Jest.
jest.mock("nativewind", () => ({ styled: (c: unknown) => c }));

// Ionicons cannot render in Jest — stub it with a View that carries a
// deterministic testID so we can assert icon presence/absence.
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Ionicons = ({
    name,
    testID,
    ...rest
  }: {
    name: string;
    testID?: string;
    [key: string]: unknown;
  }) =>
    React.createElement(View, {
      testID: testID ?? `icon-${name}`,
      ...rest,
    });
  return { Ionicons };
});

describe("Button", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Children rendering
  // ---------------------------------------------------------------------------

  describe("children rendering", () => {
    it("should render children text correctly", () => {
      // Arrange / Act
      const { getByText } = render(
        <Button onPress={jest.fn()}>Confirm</Button>
      );
      // Assert
      expect(getByText("Confirm")).toBeTruthy();
    });

    it("should render children when a multi-word label is passed", () => {
      // Arrange / Act
      const { getByText } = render(
        <Button onPress={jest.fn()}>Save changes</Button>
      );
      // Assert
      expect(getByText("Save changes")).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // testID forwarding
  // ---------------------------------------------------------------------------

  describe("testID prop", () => {
    it("should forward testID to the touchable element", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} testID="btn-submit">
          Submit
        </Button>
      );
      // Assert
      expect(getByTestId("btn-submit")).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // onPress behaviour
  // ---------------------------------------------------------------------------

  describe("onPress", () => {
    it("should call onPress when pressed", () => {
      // Arrange
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button onPress={handlePress} testID="btn">
          Press me
        </Button>
      );
      // Act
      fireEvent.press(getByTestId("btn"));
      // Assert
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it("should NOT call onPress when disabled is true", () => {
      // Arrange
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button onPress={handlePress} disabled testID="btn">
          Press me
        </Button>
      );
      // Act
      fireEvent.press(getByTestId("btn"));
      // Assert
      expect(handlePress).not.toHaveBeenCalled();
    });

    it("should NOT call onPress when loading is true", () => {
      // Arrange
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button onPress={handlePress} loading testID="btn">
          Press me
        </Button>
      );
      // Act
      fireEvent.press(getByTestId("btn"));
      // Assert
      expect(handlePress).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  describe("loading state", () => {
    it("should show ActivityIndicator when loading is true", () => {
      // Arrange / Act
      const { getByTestId, UNSAFE_getAllByType } = render(
        <Button onPress={jest.fn()} loading testID="btn">
          Save
        </Button>
      );
      const { ActivityIndicator } = require("react-native");
      // Assert — ActivityIndicator is present in the tree
      expect(getByTestId("btn")).toBeTruthy();
      expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    });

    it("should hide children text while loading", () => {
      // Arrange / Act
      const { queryByText } = render(
        <Button onPress={jest.fn()} loading>
          Hidden text
        </Button>
      );
      // Assert
      expect(queryByText("Hidden text")).toBeNull();
    });

    it("should show children text when loading is false", () => {
      // Arrange / Act
      const { getByText } = render(
        <Button onPress={jest.fn()} loading={false}>
          Visible text
        </Button>
      );
      // Assert
      expect(getByText("Visible text")).toBeTruthy();
    });

    it("should NOT show ActivityIndicator when loading is false", () => {
      // Arrange / Act
      const { UNSAFE_queryAllByType } = render(
        <Button onPress={jest.fn()} loading={false}>
          Ready
        </Button>
      );
      const { ActivityIndicator } = require("react-native");
      // Assert
      expect(UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Disabled state
  // ---------------------------------------------------------------------------

  describe("disabled state", () => {
    it("should render without crashing when disabled", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} disabled testID="btn-disabled">
          Disabled
        </Button>
      );
      // Assert
      expect(getByTestId("btn-disabled")).toBeTruthy();
    });

    it("should still show children text when disabled", () => {
      // Arrange / Act
      const { getByText } = render(
        <Button onPress={jest.fn()} disabled>
          Still visible
        </Button>
      );
      // Assert
      expect(getByText("Still visible")).toBeTruthy();
    });

    it("should mark the touchable as disabled when disabled is true", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} disabled testID="btn">
          Disabled
        </Button>
      );
      // Assert — accessibilityState.disabled is set by TouchableOpacity
      expect(getByTestId("btn").props.accessibilityState?.disabled).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Variants — render without crash + stable snapshot
  // ---------------------------------------------------------------------------

  describe("variant prop", () => {
    const variants = [
      "primary",
      "secondary",
      "tertiary",
      "neutral",
      "textLink",
      "danger",
    ] as const;

    variants.forEach((variant) => {
      it(`should render variant='${variant}' without errors`, () => {
        // Arrange / Act
        const { getByText } = render(
          <Button onPress={jest.fn()} variant={variant}>
            Label
          </Button>
        );
        // Assert
        expect(getByText("Label")).toBeTruthy();
      });
    });

    it("should match snapshot for variant='primary'", () => {
      // Arrange / Act
      const tree = render(
        <Button onPress={jest.fn()} variant="primary" testID="btn">
          Primary
        </Button>
      ).toJSON();
      // Assert
      expect(tree).toMatchSnapshot();
    });

    it("should match snapshot for variant='secondary'", () => {
      // Arrange / Act
      const tree = render(
        <Button onPress={jest.fn()} variant="secondary" testID="btn">
          Secondary
        </Button>
      ).toJSON();
      // Assert
      expect(tree).toMatchSnapshot();
    });

    it("should match snapshot for variant='danger'", () => {
      // Arrange / Act
      const tree = render(
        <Button onPress={jest.fn()} variant="danger" testID="btn">
          Delete
        </Button>
      ).toJSON();
      // Assert
      expect(tree).toMatchSnapshot();
    });
  });

  // ---------------------------------------------------------------------------
  // Size prop — render without crash + snapshot
  // ---------------------------------------------------------------------------

  describe("size prop", () => {
    it("should render size='sm' without errors", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} size="sm" testID="btn">
          Small
        </Button>
      );
      // Assert
      expect(getByTestId("btn")).toBeTruthy();
    });

    it("should render size='md' without errors", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} size="md" testID="btn">
          Medium
        </Button>
      );
      // Assert
      expect(getByTestId("btn")).toBeTruthy();
    });

    it("should render size='lg' without errors", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} size="lg" testID="btn">
          Large
        </Button>
      );
      // Assert
      expect(getByTestId("btn")).toBeTruthy();
    });

    it("should match snapshot for size='sm'", () => {
      // Arrange / Act
      const tree = render(
        <Button onPress={jest.fn()} size="sm" testID="btn">
          Small
        </Button>
      ).toJSON();
      // Assert
      expect(tree).toMatchSnapshot();
    });

    it("should match snapshot for size='lg'", () => {
      // Arrange / Act
      const tree = render(
        <Button onPress={jest.fn()} size="lg" testID="btn">
          Large
        </Button>
      ).toJSON();
      // Assert
      expect(tree).toMatchSnapshot();
    });
  });

  // ---------------------------------------------------------------------------
  // Icon props
  // ---------------------------------------------------------------------------

  describe("leftIconName prop", () => {
    it("should render an icon before the text when leftIconName is provided", () => {
      // Arrange / Act
      const { getByTestId, getByText } = render(
        <Button onPress={jest.fn()} leftIconName="add-circle-outline">
          Add item
        </Button>
      );
      // Assert
      expect(getByTestId("icon-add-circle-outline")).toBeTruthy();
      expect(getByText("Add item")).toBeTruthy();
    });

    it("should NOT render a left icon when leftIconName is not provided", () => {
      // Arrange / Act
      const { queryByTestId } = render(
        <Button onPress={jest.fn()}>No icon</Button>
      );
      // Assert
      expect(queryByTestId(/^icon-/)).toBeNull();
    });
  });

  describe("rightIconName prop", () => {
    it("should render an icon after the text when rightIconName is provided", () => {
      // Arrange / Act
      const { getByTestId, getByText } = render(
        <Button onPress={jest.fn()} rightIconName="chevron-forward-outline">
          Next
        </Button>
      );
      // Assert
      expect(getByTestId("icon-chevron-forward-outline")).toBeTruthy();
      expect(getByText("Next")).toBeTruthy();
    });

    it("should render both left and right icons simultaneously", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button
          onPress={jest.fn()}
          leftIconName="star-outline"
          rightIconName="chevron-forward-outline"
        >
          Favorite
        </Button>
      );
      // Assert
      expect(getByTestId("icon-star-outline")).toBeTruthy();
      expect(getByTestId("icon-chevron-forward-outline")).toBeTruthy();
    });

    it("should NOT render icons when loading is true", () => {
      // Arrange / Act
      const { queryByTestId } = render(
        <Button
          onPress={jest.fn()}
          loading
          leftIconName="star-outline"
          rightIconName="chevron-forward-outline"
        >
          Loading
        </Button>
      );
      // Assert — icons are replaced by ActivityIndicator while loading
      expect(queryByTestId("icon-star-outline")).toBeNull();
      expect(queryByTestId("icon-chevron-forward-outline")).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // className override — passed prop is accepted, component renders correctly
  // ---------------------------------------------------------------------------

  describe("className prop", () => {
    it("should render without errors when className is provided", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} className="w-full" testID="btn">
          Full width
        </Button>
      );
      // Assert
      expect(getByTestId("btn")).toBeTruthy();
    });

    it("should still show children text when className is provided", () => {
      // Arrange / Act
      const { getByText } = render(
        <Button onPress={jest.fn()} className="mt-4">
          With extra class
        </Button>
      );
      // Assert
      expect(getByText("With extra class")).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // Default props behaviour
  // ---------------------------------------------------------------------------

  describe("default props", () => {
    it("should render with primary variant by default (no variant prop needed)", () => {
      // Arrange / Act — no variant passed, should not crash
      const { getByTestId } = render(
        <Button onPress={jest.fn()} testID="btn">
          Default
        </Button>
      );
      // Assert
      expect(getByTestId("btn")).toBeTruthy();
    });

    it("should render with md size by default (no size prop needed)", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Button onPress={jest.fn()} testID="btn">
          Default size
        </Button>
      );
      // Assert
      expect(getByTestId("btn")).toBeTruthy();
    });

    it("should be enabled and respond to press by default", () => {
      // Arrange
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button onPress={handlePress} testID="btn">
          Clickable
        </Button>
      );
      // Act
      fireEvent.press(getByTestId("btn"));
      // Assert
      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it("should not show ActivityIndicator by default", () => {
      // Arrange / Act
      const { UNSAFE_queryAllByType } = render(
        <Button onPress={jest.fn()}>Default</Button>
      );
      const { ActivityIndicator } = require("react-native");
      // Assert
      expect(UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Compound: loading + disabled interaction
  // ---------------------------------------------------------------------------

  describe("loading and disabled interaction", () => {
    it("should show ActivityIndicator (not disabled styles) when both loading and disabled are true", () => {
      // Arrange / Act — loading takes precedence over disabled for styling
      const { UNSAFE_getAllByType } = render(
        <Button onPress={jest.fn()} loading disabled>
          Processing
        </Button>
      );
      const { ActivityIndicator } = require("react-native");
      // Assert — spinner is shown (loading path executed, not disabled path)
      expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    });

    it("should block onPress when both loading and disabled are true", () => {
      // Arrange
      const handlePress = jest.fn();
      const { getByTestId } = render(
        <Button onPress={handlePress} loading disabled testID="btn">
          Processing
        </Button>
      );
      // Act
      fireEvent.press(getByTestId("btn"));
      // Assert
      expect(handlePress).not.toHaveBeenCalled();
    });
  });
});
