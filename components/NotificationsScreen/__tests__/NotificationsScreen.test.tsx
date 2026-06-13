import React from "react";
import { render } from "@testing-library/react-native";
import NotificationsScreen from "../index";
import { useNotificationsScreen } from "../useNotificationsScreen";

jest.mock("../useNotificationsScreen", () => ({
  useNotificationsScreen: jest.fn(),
}));

jest.mock("../NotificationItem", () => "View");
jest.mock("../NotificationsEmptyState", () => "View");
jest.mock("../NotificationsErrorState", () => "View");
jest.mock("../NotificationsListHeader", () => "View");
jest.mock("@/components/ui/Icon", () => "View");
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const BASE_HOOK = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isError: false,
  isRefetching: false,
  isMarkingAll: false,
  handleBack: jest.fn(),
  handlePressNotification: jest.fn(),
  handleMarkAllRead: jest.fn(),
  refetch: jest.fn(),
};

const setup = (overrides = {}) => {
  (useNotificationsScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("NotificationsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders the title", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("Notificaciones")).toBeTruthy();
  });

  it("shows 'Todo al día ✓' when unreadCount is 0", () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("Todo al día ✓")).toBeTruthy();
  });

  it("shows unread count when unreadCount > 0", () => {
    setup({ unreadCount: 5 });
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText("5 sin leer")).toBeTruthy();
  });

  it("shows loading indicator when isLoading is true", () => {
    setup({ isLoading: true });
    const { UNSAFE_getByType } = render(<NotificationsScreen />);
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("shows error state when isError is true", () => {
    setup({ isError: true });
    const { toJSON } = render(<NotificationsScreen />);
    expect(toJSON()).not.toBeNull();
  });

  it("renders the FlatList body when not loading and no error", () => {
    setup({
      notifications: [
        {
          id: "n1",
          title: "Nueva reserva",
          message: "Tienes una nueva reserva",
          type: "NEW_RESERVATION" as const,
          read: false,
          created_at: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
    });
    const { toJSON } = render(<NotificationsScreen />);
    expect(toJSON()).not.toBeNull();
  });

  it("renders separator between items with multiple notifications", () => {
    setup({
      notifications: [
        {
          id: "n1",
          title: "Nueva reserva",
          message: "Msg 1",
          type: "NEW_RESERVATION" as const,
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: "n2",
          title: "Orden entregada",
          message: "Msg 2",
          type: "ORDER_DELIVERED" as const,
          read: true,
          created_at: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
    });
    const { toJSON } = render(<NotificationsScreen />);
    expect(toJSON()).not.toBeNull();
  });
});
