import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import NotificationsListHeader from "../NotificationsListHeader";

describe("NotificationsListHeader", () => {
  describe("when there are unread notifications", () => {
    it("shows the unread count", () => {
      const { getByText } = render(
        <NotificationsListHeader
          unreadCount={3}
          isMarkingAll={false}
          onMarkAllRead={jest.fn()}
        />,
      );
      expect(getByText("3 sin leer")).toBeTruthy();
    });

    it("renders the mark-all-read button", () => {
      const { getByTestId } = render(
        <NotificationsListHeader
          unreadCount={3}
          isMarkingAll={false}
          onMarkAllRead={jest.fn()}
        />,
      );
      expect(getByTestId("btn-mark-all-read")).toBeTruthy();
    });

    it("calls onMarkAllRead when the button is pressed", () => {
      const onMarkAllRead = jest.fn();
      const { getByTestId } = render(
        <NotificationsListHeader
          unreadCount={3}
          isMarkingAll={false}
          onMarkAllRead={onMarkAllRead}
        />,
      );
      fireEvent.press(getByTestId("btn-mark-all-read"));
      expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    });

    it("disables the button when isMarkingAll is true", () => {
      const { getByTestId } = render(
        <NotificationsListHeader
          unreadCount={3}
          isMarkingAll
          onMarkAllRead={jest.fn()}
        />,
      );
      expect(
        getByTestId("btn-mark-all-read").props.accessibilityState?.disabled,
      ).toBeTruthy();
    });
  });

  describe("when all notifications are read", () => {
    it("shows the 'Todo al día' message", () => {
      const { getByText } = render(
        <NotificationsListHeader
          unreadCount={0}
          isMarkingAll={false}
          onMarkAllRead={jest.fn()}
        />,
      );
      expect(getByText("Todo al día ✓")).toBeTruthy();
    });

    it("does not render the mark-all-read button", () => {
      const { queryByTestId } = render(
        <NotificationsListHeader
          unreadCount={0}
          isMarkingAll={false}
          onMarkAllRead={jest.fn()}
        />,
      );
      expect(queryByTestId("btn-mark-all-read")).toBeNull();
    });
  });
});
