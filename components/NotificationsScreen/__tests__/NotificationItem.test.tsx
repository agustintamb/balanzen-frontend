import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import type { Notification } from "@/api/notifications/notifications.types";
import NotificationItem from "../NotificationItem";

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

const FIXED_DATE = new Date("2026-01-15T11:59:30.000Z").toISOString();

const buildNotification = (
  overrides: Partial<Notification> = {},
): Notification => ({
  id: "notif-1",
  type: "NEW_RESERVATION",
  title: "Nueva reserva",
  message: "Recibiste una nueva reserva",
  read: false,
  created_at: FIXED_DATE,
  ...overrides,
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("NotificationItem", () => {
  describe("rendering", () => {
    it("renders the notification title", () => {
      const { getByText } = render(
        <NotificationItem
          notification={buildNotification()}
          onPress={jest.fn()}
        />,
      );
      expect(getByText("Nueva reserva")).toBeTruthy();
    });

    it("renders the notification message", () => {
      const { getByText } = render(
        <NotificationItem
          notification={buildNotification()}
          onPress={jest.fn()}
        />,
      );
      expect(getByText("Recibiste una nueva reserva")).toBeTruthy();
    });

    it("renders the time-ago label", () => {
      const { getByText } = render(
        <NotificationItem
          notification={buildNotification()}
          onPress={jest.fn()}
        />,
      );
      expect(getByText("Ahora")).toBeTruthy();
    });
  });

  describe("read / unread indicator", () => {
    it("renders a dot indicator for unread notifications", () => {
      const { UNSAFE_getAllByType } = render(
        <NotificationItem
          notification={buildNotification({ read: false })}
          onPress={jest.fn()}
        />,
      );
      const { View } = require("react-native");
      const views = UNSAFE_getAllByType(View);
      const dot = views.find(
        (v: { props: { className?: string } }) =>
          v.props.className?.includes("bg-error") &&
          v.props.className?.includes("rounded-full"),
      );
      expect(dot).toBeTruthy();
    });

    it("does not render a dot indicator for read notifications", () => {
      const { UNSAFE_getAllByType } = render(
        <NotificationItem
          notification={buildNotification({ read: true })}
          onPress={jest.fn()}
        />,
      );
      const { View } = require("react-native");
      const views = UNSAFE_getAllByType(View);
      const dot = views.find(
        (v: { props: { className?: string } }) =>
          v.props.className?.includes("bg-error") &&
          v.props.className?.includes("rounded-full"),
      );
      expect(dot).toBeUndefined();
    });
  });

  describe("interaction", () => {
    it("calls onPress with the notification id when pressed", () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <NotificationItem
          notification={buildNotification()}
          onPress={onPress}
        />,
      );
      fireEvent.press(getByText("Nueva reserva"));
      expect(onPress).toHaveBeenCalledWith("notif-1");
    });
  });

  describe("notification types", () => {
    const TYPES: Notification["type"][] = [
      "NEW_RESERVATION",
      "RESERVATION_CANCELLED_BY_CONSUMER",
      "RESERVATION_CANCELLED_BY_COMMERCE",
      "ORDER_DELIVERED",
      "NEW_MESSAGE",
      "PUBLICATION_EXPIRING",
      "PUBLICATION_EXPIRED",
    ];

    it.each(TYPES)("renders without crashing for type '%s'", (type) => {
      expect(() =>
        render(
          <NotificationItem
            notification={buildNotification({ type })}
            onPress={jest.fn()}
          />,
        ),
      ).not.toThrow();
    });

    it("uses the fallback config for unknown notification types", () => {
      expect(() =>
        render(
          <NotificationItem
            notification={buildNotification({ type: "UNKNOWN_TYPE" as any })}
            onPress={jest.fn()}
          />,
        ),
      ).not.toThrow();
    });
  });
});
