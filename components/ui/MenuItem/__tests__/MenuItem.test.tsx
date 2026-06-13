import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import MenuItem from "../index";

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

describe("MenuItem", () => {
  describe("rendering", () => {
    it("renders the children text", () => {
      const { getByText } = render(
        <MenuItem onPress={jest.fn()}>Editar Perfil</MenuItem>,
      );
      expect(getByText("Editar Perfil")).toBeTruthy();
    });

    it("renders and responds to press events", () => {
      const onPress = jest.fn();
      const { getByText } = render(<MenuItem onPress={onPress}>Item</MenuItem>);
      fireEvent.press(getByText("Item"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it("renders the badge when badgeCount > 0", () => {
      const { getByText } = render(
        <MenuItem onPress={jest.fn()} badgeCount={5}>
          Notificaciones
        </MenuItem>,
      );
      expect(getByText("5")).toBeTruthy();
    });

    it("renders '99+' when badgeCount exceeds 99", () => {
      const { getByText } = render(
        <MenuItem onPress={jest.fn()} badgeCount={150}>
          Notificaciones
        </MenuItem>,
      );
      expect(getByText("99+")).toBeTruthy();
    });

    it("does not render a badge when badgeCount is 0", () => {
      const { queryByText } = render(
        <MenuItem onPress={jest.fn()} badgeCount={0}>
          Notificaciones
        </MenuItem>,
      );
      expect(queryByText("0")).toBeNull();
    });

    it("does not render a badge when badgeCount is undefined", () => {
      const { UNSAFE_getAllByType } = render(
        <MenuItem onPress={jest.fn()}>Item</MenuItem>,
      );
      const { View } = require("react-native");
      const views = UNSAFE_getAllByType(View);
      const badgeView = views.find((v: { props: { className?: string } }) =>
        v.props.className?.includes("bg-error rounded-full"),
      );
      expect(badgeView).toBeUndefined();
    });
  });

  describe("interaction", () => {
    it("calls onPress when the item is pressed", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <MenuItem onPress={onPress} testID="menu-item">
          Item
        </MenuItem>,
      );
      fireEvent.press(getByText("Item"));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("position variants", () => {
    it.each(["first", "middle", "last", "single"] as const)(
      "renders with position '%s' without crashing",
      (position) => {
        const { toJSON } = render(
          <MenuItem onPress={jest.fn()} position={position}>
            Item
          </MenuItem>,
        );
        expect(toJSON()).not.toBeNull();
      },
    );
  });

  describe("leftIcon", () => {
    it("renders a left icon when leftIcon prop is provided", () => {
      const { toJSON } = render(
        <MenuItem onPress={jest.fn()} leftIcon="user">
          Item
        </MenuItem>,
      );
      expect(toJSON()).not.toBeNull();
    });

    it("renders a left icon in error color when variant is danger", () => {
      const { toJSON } = render(
        <MenuItem onPress={jest.fn()} variant="danger" leftIcon="trash">
          Cerrar sesión
        </MenuItem>,
      );
      expect(toJSON()).not.toBeNull();
    });
  });

  describe("variants", () => {
    it("renders danger variant text in error color", () => {
      const { getByText } = render(
        <MenuItem onPress={jest.fn()} variant="danger">
          Cerrar sesión
        </MenuItem>,
      );
      const text = getByText("Cerrar sesión");
      expect(text.props.className).toContain("text-error");
    });

    it("renders default variant text in primary-dark color", () => {
      const { getByText } = render(
        <MenuItem onPress={jest.fn()}>Editar Perfil</MenuItem>,
      );
      const text = getByText("Editar Perfil");
      expect(text.props.className).toContain("text-primary-dark");
    });
  });
});
