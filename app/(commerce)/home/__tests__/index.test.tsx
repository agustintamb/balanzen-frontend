import React from "react";
import { render } from "@testing-library/react-native";
import CommerceHome from "@/app/(commerce)/home/index";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
}));

jest.mock("@/app/(commerce)/home/useCommerceHomeScreen", () => ({
  useCommerceHomeScreen: jest.fn(),
  default: () => null,
  FILTERS: [
    { key: "ALL", label: "Todas" },
    { key: "ACTIVE", label: "Activas" },
    { key: "RESERVED", label: "Reservadas" },
    { key: "DELIVERED", label: "Entregadas" },
    { key: "CANCELLED", label: "Canceladas" },
  ],
  DATE_FILTERS: [
    { key: "all", label: "Todo" },
    { key: "today", label: "Hoy" },
    { key: "week", label: "Esta semana" },
    { key: "month", label: "Este mes" },
  ],
  SORT_FILTERS: [
    { key: "recent", label: "Más recientes" },
    { key: "oldest", label: "Más antiguos" },
  ],
}));

const { useCommerceHomeScreen } = require(
  "@/app/(commerce)/home/useCommerceHomeScreen",
);

const buildDefaultHookReturn = (overrides = {}) => ({
  businessName: "Mi Comercio",
  unreadCount: 0,
  activeReservations: 2,
  expiringSoonCount: 1,
  publications: [],
  search: "",
  isLoading: false,
  isError: false,
  isRefetching: false,
  activeFilter: "ACTIVE" as const,
  hasActiveFilters: false,
  isFilterSheetVisible: false,
  pendingDateFilter: "all" as const,
  pendingSort: "recent" as const,
  handleRefetch: jest.fn(),
  handleBell: jest.fn(),
  handleFilterChange: jest.fn(),
  handleOpenFilterSheet: jest.fn(),
  handleCloseFilterSheet: jest.fn(),
  handleApplyFilters: jest.fn(),
  handleResetFilters: jest.fn(),
  handlePendingDateChange: jest.fn(),
  handlePendingSortChange: jest.fn(),
  onSearchChange: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  useCommerceHomeScreen.mockReturnValue(buildDefaultHookReturn());
});

describe("CommerceHome screen", () => {
  it("renders the publications list", () => {
    const { getByTestId } = render(<CommerceHome />);
    expect(getByTestId("publications-list")).toBeTruthy();
  });

  it("renders the metric cards", () => {
    const { getByText } = render(<CommerceHome />);
    expect(getByText("Reservas activas")).toBeTruthy();
    expect(getByText(/Vence/)).toBeTruthy();
  });

  it("renders the 'Mis publicaciones' heading", () => {
    const { getByText } = render(<CommerceHome />);
    expect(getByText("Mis publicaciones")).toBeTruthy();
  });

  it("shows error body when isError and no publications", () => {
    useCommerceHomeScreen.mockReturnValue(
      buildDefaultHookReturn({ isError: true, publications: [] }),
    );
    const { getByText } = render(<CommerceHome />);
    expect(
      getByText("No pudimos cargar los datos. Revisá tu conexión."),
    ).toBeTruthy();
  });

  it("does not show error body when publications are available despite isError", () => {
    useCommerceHomeScreen.mockReturnValue(
      buildDefaultHookReturn({
        isError: true,
        publications: [
          {
            id: "pub-1",
            title: "Pub",
            description: "",
            original_price: 1000,
            final_price: 800,
            discount_pct: 20,
            expiry_date: "2099-12-31",
            category: { id: "c", name: "Cat" },
            photos: [],
            status: "ACTIVE",
            is_donation: false,
            commerce: {
              id: "com",
              business_name: "Shop",
              selected_address: {
                formatted_address: "Addr",
                lat: -34,
                lng: -58,
              },
            },
            created_at: "2026-01-01",
          },
        ],
      }),
    );
    const { queryByText } = render(<CommerceHome />);
    expect(
      queryByText("No pudimos cargar los datos. Revisá tu conexión."),
    ).toBeNull();
  });

  it("renders the business name in the header", () => {
    const { getByText } = render(<CommerceHome />);
    expect(getByText("Mi Comercio")).toBeTruthy();
  });
});
