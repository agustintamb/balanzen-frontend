import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import ConsumerHome from "../home";

jest.mock("@/utils/navigation", () => ({ safePush: jest.fn() }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

jest.mock("@/hooks/useUsers", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/hooks/useNotifications", () => ({ useNotifications: jest.fn() }));
jest.mock("@/hooks/useCategories", () => ({ useCategories: jest.fn() }));
jest.mock("@/hooks/usePublications", () => ({ usePublications: jest.fn() }));

jest.mock("@/components/ui/ProductCard", () => {
  const { View, Text } = require("react-native");
  function MockProductCard({ publication }: any) {
    return (
      <View>
        <Text testID={`pub-${publication.id}`}>{publication.title}</Text>
      </View>
    );
  }
  return MockProductCard;
});

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { useCurrentUser } from "@/hooks/useUsers";
import { useNotifications } from "@/hooks/useNotifications";
import { useCategories } from "@/hooks/useCategories";
import { usePublications } from "@/hooks/usePublications";
import { safePush } from "@/utils/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockHooks = ({
  firstName = "Juan",
  unreadCount = 0,
  categories = [] as any[],
  publications = [] as any[],
  isLoading = false,
  isError = false,
  hasLatLng = true,
} = {}) => {
  (useCurrentUser as jest.Mock).mockReturnValue({
    data: {
      first_name: firstName,
      selected_address: hasLatLng
        ? { lat: -34.6, lng: -58.4, formatted_address: "Corrientes 1234" }
        : null,
    },
  });
  (useNotifications as jest.Mock).mockReturnValue({
    data: { unread_count: unreadCount, notifications: [] },
  });
  (useCategories as jest.Mock).mockReturnValue({ data: categories });
  (usePublications as jest.Mock).mockReturnValue({
    data: {
      publications,
      pagination: {
        page: 1,
        limit: 20,
        total: publications.length,
        total_pages: 1,
      },
    },
    isLoading,
    isError,
    refetch: jest.fn(),
    isRefetching: false,
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ConsumerHome", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
  });

  it("renders the greeting with user first name", () => {
    const { getByText } = render(<ConsumerHome />);
    expect(getByText("¡Hola, Juan!")).toBeTruthy();
  });

  it("renders category filter chips without Donaciones", () => {
    mockHooks({ categories: [{ id: "cat-1", name: "Verduras" }] });
    const { getByText, queryByText } = render(<ConsumerHome />);
    expect(getByText("Todas")).toBeTruthy();
    expect(getByText("Verduras")).toBeTruthy();
    expect(queryByText("Donaciones")).toBeNull();
  });

  it("renders the filter button", () => {
    const { getByTestId } = render(<ConsumerHome />);
    expect(getByTestId("btn-filter")).toBeTruthy();
  });

  it("opens filter sheet with tipo, sort sections when filter button is pressed", () => {
    const { getByTestId, getByText } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByText("Filtros")).toBeTruthy();
    expect(getByText("Todo")).toBeTruthy();
    expect(getByText("Con descuento")).toBeTruthy();
    expect(getByText("Donación")).toBeTruthy();
    expect(getByText("Más recientes")).toBeTruthy();
    expect(getByText("Mayor descuento")).toBeTruthy();
    expect(getByText("Vence antes")).toBeTruthy();
  });

  it("shows distance section and Más cercano when lat/lng available", () => {
    const { getByTestId, getByText } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByText("Cualquiera")).toBeTruthy();
    expect(getByText("< 1 km")).toBeTruthy();
    expect(getByText("Más cercano")).toBeTruthy();
  });

  it("hides distance section and Más cercano when no lat/lng", () => {
    mockHooks({ hasLatLng: false });
    const { getByTestId, queryByText } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(queryByText("Cualquiera")).toBeNull();
    expect(queryByText("Más cercano")).toBeNull();
  });

  it("closes filter sheet when close button is pressed", () => {
    const { getByTestId, queryByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByTestId("filter-sheet")).toBeTruthy();
    fireEvent.press(getByTestId("filter-sheet-close"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("applies filters and closes sheet when Aplicar is pressed", () => {
    const { getByTestId, getByText, queryByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Con descuento"));
    fireEvent.press(getByTestId("filter-sheet-apply"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("resets pending filters when Limpiar is pressed", () => {
    const { getByTestId, getByText } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Donación"));
    fireEvent.press(getByTestId("filter-sheet-reset"));
    expect(getByText("Todo")).toBeTruthy();
  });

  it("renders publication cards from the list", () => {
    mockHooks({
      publications: [
        {
          id: "pub-1",
          title: "Mix de Verduras",
          final_price: 1500,
          original_price: 3000,
          is_donation: false,
          photos: [],
          status: "ACTIVE",
          discount_pct: 50,
          description: "",
          expiry_date: "2026-12-31",
          category: { id: "cat-1", name: "Verduras" },
          commerce: {
            id: "c-1",
            business_name: "Don Mario",
            selected_address: {
              formatted_address: "Corrientes 1234",
              lat: -34.6,
              lng: -58.4,
            },
          },
          created_at: "2026-01-01",
        },
      ],
    });
    const { getByTestId } = render(<ConsumerHome />);
    expect(getByTestId("pub-pub-1")).toBeTruthy();
  });

  it("shows empty state when no publications", () => {
    mockHooks({ publications: [] });
    const { getByText } = render(<ConsumerHome />);
    expect(getByText("No hay publicaciones disponibles.")).toBeTruthy();
  });

  it("navigates to notifications when the bell is pressed", () => {
    const { getByTestId } = render(<ConsumerHome />);
    fireEvent.press(getByTestId("btn-notifications"));
    expect(safePush).toHaveBeenCalledWith("/notifications");
  });

  it("shows error state when fetch fails and list is empty", () => {
    mockHooks({ isError: true, publications: [] });
    const { getByText } = render(<ConsumerHome />);
    expect(getByText("No se pudieron cargar las publicaciones.")).toBeTruthy();
  });
});
