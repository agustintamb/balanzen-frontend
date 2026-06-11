import React from "react";
import { render } from "@testing-library/react-native";
import Icon from "@/components/ui/Icon";

// Mock @expo/vector-icons so tests run in the Jest/Node environment
jest.mock("@expo/vector-icons", () => ({
  Feather: ({
    name,
    size,
    color,
    testID,
  }: {
    name: string;
    size?: number;
    color?: string;
    testID?: string;
  }) => {
    const { Text } = require("react-native");
    return (
      <Text
        testID={testID ?? `icon-${name}`}
        data-size={size}
        data-color={color}
      >
        {name}
      </Text>
    );
  },
}));

describe("Icon", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("icon name rendering", () => {
    it("should render the Feather icon with the correct name", () => {
      // Arrange / Act
      const { getByText } = render(<Icon name="home" />);
      // Assert — the mocked Feather renders the name as text content
      expect(getByText("home")).toBeTruthy();
    });

    it("should render a different icon name correctly", () => {
      // Arrange / Act
      const { getByText } = render(<Icon name="shopping-cart" />);
      // Assert
      expect(getByText("shopping-cart")).toBeTruthy();
    });
  });

  describe("variant — plain", () => {
    it("should NOT render a background container when variant is plain", () => {
      // Arrange / Act
      const { queryByTestId } = render(
        <Icon name="home" variant="plain" testID="icon-container" />,
      );
      // Assert — plain variant returns only <Feather>, no wrapping View with testID
      expect(queryByTestId("icon-container")).toBeNull();
    });

    it("should render directly without a View wrapper when variant is plain (default)", () => {
      // Arrange / Act
      const { queryByTestId } = render(
        <Icon name="home" testID="icon-container" />,
      );
      // Assert — default variant is plain, so no container View
      expect(queryByTestId("icon-container")).toBeNull();
    });
  });

  describe("variant — soft", () => {
    it("should render a background container when variant is soft", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon name="home" variant="soft" testID="icon-container" />,
      );
      // Assert
      expect(getByTestId("icon-container")).toBeTruthy();
    });

    it("should apply soft background class for primary color", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon
          name="home"
          variant="soft"
          color="primary"
          testID="icon-container"
        />,
      );
      // Assert
      const container = getByTestId("icon-container");
      expect(container.props.className).toContain("bg-primary-light");
    });
  });

  describe("variant — filled", () => {
    it("should render a filled background container when variant is filled", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon name="home" variant="filled" testID="icon-container" />,
      );
      // Assert
      expect(getByTestId("icon-container")).toBeTruthy();
    });

    it("should apply filled background class for primary color", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon
          name="home"
          variant="filled"
          color="primary"
          testID="icon-container"
        />,
      );
      // Assert
      const container = getByTestId("icon-container");
      expect(container.props.className).toContain("bg-primary");
    });

    it("should apply filled error background when variant is filled and color is error", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon
          name="alert-circle"
          variant="filled"
          color="error"
          testID="icon-container"
        />,
      );
      // Assert
      const container = getByTestId("icon-container");
      expect(container.props.className).toContain("bg-error");
    });
  });

  describe("variant — outline", () => {
    it("should render a bordered container when variant is outline", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon name="home" variant="outline" testID="icon-container" />,
      );
      // Assert
      expect(getByTestId("icon-container")).toBeTruthy();
    });

    it("should apply border class for primary color in outline variant", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon
          name="home"
          variant="outline"
          color="primary"
          testID="icon-container"
        />,
      );
      // Assert
      const container = getByTestId("icon-container");
      expect(container.props.className).toContain("border-primary");
    });
  });

  describe("color prop", () => {
    it("should use the primary hex color for Feather when color is primary and variant is plain", () => {
      // Arrange / Act
      const { getByText } = render(
        <Icon name="home" variant="plain" color="primary" />,
      );
      // Assert — mocked Feather receives color as data-color attribute
      const iconNode = getByText("home");
      expect(iconNode.props["data-color"]).toBe("#639922");
    });

    it("should use the error hex color for Feather when color is error and variant is plain", () => {
      // Arrange / Act
      const { getByText } = render(
        <Icon name="alert-circle" variant="plain" color="error" />,
      );
      // Assert
      const iconNode = getByText("alert-circle");
      expect(iconNode.props["data-color"]).toBe("#E84234");
    });

    it("should use white (#FFFFFF) for the icon color when variant is filled", () => {
      // Arrange / Act
      const { getByText } = render(
        <Icon name="home" variant="filled" color="primary" />,
      );
      // Assert — filled icons always use white regardless of color
      const iconNode = getByText("home");
      expect(iconNode.props["data-color"]).toBe("#FFFFFF");
    });
  });

  describe("size prop", () => {
    it("should pass the size prop to Feather (defaults to 20)", () => {
      // Arrange / Act
      const { getByText } = render(<Icon name="home" />);
      // Assert
      const iconNode = getByText("home");
      expect(iconNode.props["data-size"]).toBe(20);
    });

    it("should pass a custom size to Feather", () => {
      // Arrange / Act
      const { getByText } = render(<Icon name="home" size={32} />);
      // Assert
      const iconNode = getByText("home");
      expect(iconNode.props["data-size"]).toBe(32);
    });
  });

  describe("containerSize prop", () => {
    it("should default container dimensions to size * 2 when containerSize is not provided", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon name="home" variant="soft" size={24} testID="icon-container" />,
      );
      // Assert — resolvedSize = 24 * 2 = 48
      const container = getByTestId("icon-container");
      expect(container.props.style).toMatchObject({ width: 48, height: 48 });
    });

    it("should use the explicit containerSize when provided", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon
          name="home"
          variant="soft"
          size={20}
          containerSize={56}
          testID="icon-container"
        />,
      );
      // Assert
      const container = getByTestId("icon-container");
      expect(container.props.style).toMatchObject({ width: 56, height: 56 });
    });

    it("should not render style dimensions for plain variant (no container)", () => {
      // Arrange / Act
      const { queryByTestId } = render(
        <Icon
          name="home"
          variant="plain"
          containerSize={56}
          testID="icon-container"
        />,
      );
      // Assert — plain has no wrapping View
      expect(queryByTestId("icon-container")).toBeNull();
    });
  });

  describe("testID forwarding", () => {
    it("should forward testID to the container View for non-plain variants", () => {
      // Arrange / Act
      const { getByTestId } = render(
        <Icon name="home" variant="soft" testID="my-icon" />,
      );
      // Assert
      expect(getByTestId("my-icon")).toBeTruthy();
    });

    it("should not throw when testID is omitted on a non-plain variant", () => {
      // Arrange / Act / Assert
      expect(() => render(<Icon name="home" variant="filled" />)).not.toThrow();
    });
  });
});
