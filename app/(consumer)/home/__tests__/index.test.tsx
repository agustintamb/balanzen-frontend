import React from "react";
import { render } from "@testing-library/react-native";
import ConsumerHome from "@/app/(consumer)/home/index";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
}));

jest.mock("@/app/(consumer)/home/useConsumerHomeScreen", () => ({
  useConsumerHomeScreen: jest.fn(),
  default: () => null,
  PUB_TYPE_FILTERS: [
    { key: "all", label: "Todo" },
    { key: "discount", label: "Descuento" },
    { key: "donation", label: "Donación" },
  ],
  MAX_RADIUS_FILTERS: [
    { key: "any", label: "Cualquiera" },
    { key: "3", label: "< 3 km" },
    { key: "10", label: "< 10 km" },
    { key: "15", label: "< 15 km" },
  ],
  SORT_FILTERS: [
    { key: "distance", label: "Cercanía" },
    { key: "discount_pct", label: "Descuento" },
    { key: "expiry_date", label: "Vencimiento" },
  ],
}));

const {
  useConsumerHomeScreen,
} = require("@/app/(consumer)/home/useConsumerHomeScreen");

const buildDefaultHookReturn = (overrides = {}) => ({
  firstName: "Ana",
  selectedAddress: "Av. Corrientes 1234",
  unreadCount: 0,
  categoryFilters: [{ key: "all", label: "Todas" }],
  publications: [],
  selectedCategory: "all" as const,
  search: "",
  isLoading: false,
  isError: false,
  isRefetching: false,
  hasLatLng: true,
  hasActiveFilters: false,
  isFilterSheetVisible: false,
  pendingPubType: "all" as const,
  pendingMaxRadius: "any" as const,
  pendingSortBy: "distance" as const,
  onSearchChange: jest.fn(),
  handleCategoryChange: jest.fn(),
  handleBell: jest.fn(),
  handleRefetch: jest.fn(),
  handleOpenFilterSheet: jest.fn(),
  handleCloseFilterSheet: jest.fn(),
  handleApplyFilters: jest.fn(),
  handleResetFilters: jest.fn(),
  handlePendingPubTypeChange: jest.fn(),
  handlePendingMaxRadiusChange: jest.fn(),
  handlePendingSortByChange: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  useConsumerHomeScreen.mockReturnValue(buildDefaultHookReturn());
});

describe("ConsumerHome screen", () => {
  it("renders the publications list", () => {
    const { getByTestId } = render(<ConsumerHome />);
    expect(getByTestId("publications-list")).toBeTruthy();
  });

  it("renders the 'Publicaciones cercanas' heading", () => {
    const { getByText } = render(<ConsumerHome />);
    expect(getByText("Publicaciones cercanas")).toBeTruthy();
  });

  it("shows the greeting with first name", () => {
    const { getByText } = render(<ConsumerHome />);
    expect(getByText(/Hola, Ana/)).toBeTruthy();
  });

  it("shows error body when isError and no publications", () => {
    useConsumerHomeScreen.mockReturnValue(
      buildDefaultHookReturn({ isError: true, publications: [] }),
    );
    const { getByText } = render(<ConsumerHome />);
    expect(
      getByText("No pudimos cargar los datos. Revisá tu conexión."),
    ).toBeTruthy();
  });

  it("does not show error body when there are publications despite isError", () => {
    useConsumerHomeScreen.mockReturnValue(
      buildDefaultHookReturn({
        isError: true,
        publications: [
          {
            id: "pub-1",
            title: "Pizza",
            description: "",
            original_price: 2000,
            final_price: 1400,
            discount_pct: 30,
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
    const { queryByText } = render(<ConsumerHome />);
    expect(
      queryByText("No pudimos cargar los datos. Revisá tu conexión."),
    ).toBeNull();
  });
});
