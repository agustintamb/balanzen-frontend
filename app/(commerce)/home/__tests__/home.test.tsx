import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CommerceHome from "../index";

// ─── Navigation & env ────────────────────────────────────────────────────────
jest.mock("@/utils/navigation", () => ({ safePush: jest.fn() }));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));

// ─── Hook mocks ───────────────────────────────────────────────────────────────
jest.mock("@/hooks/useUsers", () => ({ useCurrentUser: jest.fn() }));
jest.mock("@/hooks/useNotifications", () => ({ useNotifications: jest.fn() }));
jest.mock("@/hooks/useMetrics", () => ({ useMetricsSummary: jest.fn() }));
jest.mock("@/hooks/useOrders", () => ({ useOrders: jest.fn() }));
jest.mock("@/hooks/usePublications", () => ({ useMyPublications: jest.fn() }));

// ─── Component mocks ─────────────────────────────────────────────────────────
jest.mock("../components/MetricCard", () => {
  const { View, Text } = require("react-native");
  function MockMetricCard({ value, label }: any) {
    return (
      <View>
        <Text testID={`metric-${label}`}>{value}</Text>
      </View>
    );
  }
  return MockMetricCard;
});

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

jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  function MockIcon() {
    return <View />;
  }
  return MockIcon;
});

// ─── Imports after mocks ──────────────────────────────────────────────────────
import { useCurrentUser } from "@/hooks/useUsers";
import { useNotifications } from "@/hooks/useNotifications";
import { useMetricsSummary } from "@/hooks/useMetrics";
import { useOrders } from "@/hooks/useOrders";
import { useMyPublications } from "@/hooks/usePublications";
import { safePush } from "@/utils/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mockHooks = ({
  businessName = "Verdulería Don Mario",
  unreadCount = 0,
  totalPublications = 5,
  activeReservations = 2,
  publications = [] as any[],
  isLoading = false,
  isError = false,
} = {}) => {
  (useCurrentUser as jest.Mock).mockReturnValue({
    data: {
      business_name: businessName,
      first_name: "María",
      last_name: "López",
    },
  });
  (useNotifications as jest.Mock).mockReturnValue({
    data: { unread_count: unreadCount, notifications: [] },
  });
  (useMetricsSummary as jest.Mock).mockReturnValue({
    data: {
      total_publications: totalPublications,
      active_publications: 3,
      total_reservations: 10,
      total_delivered: 8,
      total_cancelled: 2,
      conversion_rate: 80,
    },
  });
  (useOrders as jest.Mock).mockReturnValue({
    data: {
      orders: [],
      pagination: {
        total: activeReservations,
        page: 1,
        limit: 1,
        total_pages: 1,
      },
    },
  });
  (useMyPublications as jest.Mock).mockReturnValue({
    data: {
      publications,
      pagination: {
        total: publications.length,
        page: 1,
        limit: 20,
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
describe("CommerceHome", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
  });

  it("shows the commerce business name in the header", () => {
    const { getByText } = render(<CommerceHome />);
    expect(getByText("Verdulería Don Mario")).toBeTruthy();
  });

  it("shows first+last name when no business_name is set", () => {
    (useCurrentUser as jest.Mock).mockReturnValue({
      data: { first_name: "Carlos", last_name: "García" },
    });
    const { getByText } = render(<CommerceHome />);
    expect(getByText("Carlos García")).toBeTruthy();
  });

  it("renders metric cards with values from hooks", () => {
    mockHooks({ totalPublications: 7, activeReservations: 3 });
    const { getByTestId } = render(<CommerceHome />);
    expect(getByTestId("metric-Publicaciones").props.children).toBe(7);
    expect(getByTestId("metric-Reservas hoy").props.children).toBe(3);
  });

  it("renders the search input in the white section", () => {
    const { getByPlaceholderText } = render(<CommerceHome />);
    expect(getByPlaceholderText("Buscar publicaciones...")).toBeTruthy();
  });

  it("renders all status filter chips", () => {
    const { getByText } = render(<CommerceHome />);
    ["Todas", "Activas", "Reservadas", "Entregadas", "Canceladas", "Vencidas"].forEach(
      (label) => expect(getByText(label)).toBeTruthy(),
    );
  });

  it("renders the filter button", () => {
    const { getByTestId } = render(<CommerceHome />);
    expect(getByTestId("btn-filter")).toBeTruthy();
  });

  it("opens the filter sheet with date and sort sections when filter button is pressed", () => {
    const { getByTestId, getByText } = render(<CommerceHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByText("Filtros")).toBeTruthy();
    expect(getByText("Todo")).toBeTruthy();
    expect(getByText("Hoy")).toBeTruthy();
    expect(getByText("Esta semana")).toBeTruthy();
    expect(getByText("Este mes")).toBeTruthy();
    expect(getByText("Más recientes")).toBeTruthy();
    expect(getByText("Más antiguos")).toBeTruthy();
  });

  it("does not show Vence antes sort option", () => {
    const { getByTestId, queryByText } = render(<CommerceHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(queryByText("Vence antes")).toBeNull();
  });

  it("closes the filter sheet without applying when close is pressed", () => {
    const { getByTestId, queryByTestId } = render(<CommerceHome />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByTestId("filter-sheet")).toBeTruthy();
    fireEvent.press(getByTestId("filter-sheet-close"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("applies filters and closes the sheet when Aplicar is pressed", () => {
    const { getByTestId, getByText, queryByTestId } = render(<CommerceHome />);
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Hoy"));
    fireEvent.press(getByTestId("filter-sheet-apply"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("resets pending filters when Limpiar is pressed", () => {
    const { getByTestId, getByText } = render(<CommerceHome />);
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Más antiguos"));
    fireEvent.press(getByTestId("filter-sheet-reset"));
    expect(getByText("Todo")).toBeTruthy();
  });

  it("shows empty state message when there are no publications", () => {
    mockHooks({ publications: [] });
    const { getByText } = render(<CommerceHome />);
    expect(getByText("Todavía no tenés publicaciones.")).toBeTruthy();
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
              lat: 0,
              lng: 0,
            },
          },
          created_at: "2026-01-01",
        },
      ],
    });
    const { getByTestId } = render(<CommerceHome />);
    expect(getByTestId("pub-pub-1")).toBeTruthy();
  });

  it("navigates to notifications when the bell is pressed", () => {
    const { getByTestId } = render(<CommerceHome />);
    fireEvent.press(getByTestId("btn-notifications"));
    expect(safePush).toHaveBeenCalledWith("/notifications");
  });

  it("shows error state with retry button when fetch fails and list is empty", () => {
    mockHooks({ isError: true, publications: [] });
    const { getByText } = render(<CommerceHome />);
    expect(
      getByText("No pudimos cargar los datos. Revisá tu conexión."),
    ).toBeTruthy();
    expect(getByText("Reintentar")).toBeTruthy();
  });

  it("changes empty label when a status filter is active", () => {
    mockHooks({ publications: [] });
    const { getByTestId, getByText } = render(<CommerceHome />);
    fireEvent.press(getByTestId("filter-ACTIVE"));
    expect(getByText("No tenés publicaciones activas.")).toBeTruthy();
  });
});
