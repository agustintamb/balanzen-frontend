import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { useOrders } from "@/hooks/useOrders";
import ConsumerOrders from "../index";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("@/hooks/useOrders", () => ({ useOrders: jest.fn() }));

jest.mock("@/components/ui/OrderCard", () => {
  const { View, Text } = require("react-native");
  function MockOrderCard({ order }: any) {
    return (
      <View>
        <Text testID={`order-${order.id}`}>{order.publication.title}</Text>
      </View>
    );
  }
  return MockOrderCard;
});

const mockUseOrders = ({
  orders = [] as any[],
  isLoading = false,
  isError = false,
} = {}) => {
  (useOrders as jest.Mock).mockReturnValue({
    data: {
      orders,
      pagination: {
        page: 1,
        limit: 20,
        total: orders.length,
        total_pages: 1,
      },
    },
    isLoading,
    isError,
    refetch: jest.fn(),
    isRefetching: false,
  });
};

describe("ConsumerOrders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrders();
  });

  it("renders the heading", () => {
    const { getByText } = render(<ConsumerOrders />);
    expect(getByText("Mis pedidos")).toBeTruthy();
  });

  it("renders status filter chips", () => {
    const { getByText } = render(<ConsumerOrders />);
    ["Todos", "Activos", "Entregados", "Cancelados"].forEach((label) =>
      expect(getByText(label)).toBeTruthy(),
    );
  });

  it("renders the filter button", () => {
    const { getByTestId } = render(<ConsumerOrders />);
    expect(getByTestId("btn-filter")).toBeTruthy();
  });

  it("opens the filter sheet with date and sort sections when filter button is pressed", () => {
    const { getByTestId, getByText } = render(<ConsumerOrders />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByText("Filtros")).toBeTruthy();
    expect(getByText("Todo")).toBeTruthy();
    expect(getByText("Hoy")).toBeTruthy();
    expect(getByText("Esta semana")).toBeTruthy();
    expect(getByText("Este mes")).toBeTruthy();
    expect(getByText("Más recientes")).toBeTruthy();
    expect(getByText("Más antiguos")).toBeTruthy();
  });

  it("closes the filter sheet without applying when close is pressed", () => {
    const { getByTestId, queryByTestId } = render(<ConsumerOrders />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByTestId("filter-sheet")).toBeTruthy();
    fireEvent.press(getByTestId("filter-sheet-close"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("resets pending filters when Limpiar is pressed", () => {
    const { getByTestId, getByText } = render(<ConsumerOrders />);
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Hoy"));
    fireEvent.press(getByTestId("filter-sheet-reset"));
    expect(getByText("Todo")).toBeTruthy();
  });

  it("applies filters and closes the sheet when Aplicar is pressed", () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <ConsumerOrders />,
    );
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Hoy"));
    fireEvent.press(getByTestId("filter-sheet-apply"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("shows empty state when there are no orders", () => {
    mockUseOrders({ orders: [] });
    const { getByText } = render(<ConsumerOrders />);
    expect(getByText("Todavía no tenés pedidos.")).toBeTruthy();
  });

  it("renders order cards", () => {
    mockUseOrders({
      orders: [
        {
          id: "order-1",
          status: "RESERVED",
          created_at: "2026-01-01",
          unread_count: 0,
          publication: {
            id: "pub-1",
            title: "Mix de Verduras",
            final_price: 1500,
            photos: [],
          },
          commerce: {
            id: "c-1",
            business_name: "Don Mario",
            selected_address: { formatted_address: "Corrientes 1234" },
          },
          consumer: { id: "u-1", first_name: "Juan", last_name: "Pérez" },
        },
      ],
    });
    const { getByTestId } = render(<ConsumerOrders />);
    expect(getByTestId("order-order-1")).toBeTruthy();
  });

  it("shows error state when fetch fails and list is empty", () => {
    mockUseOrders({ isError: true, orders: [] });
    const { getByText } = render(<ConsumerOrders />);
    expect(getByText("No se pudieron cargar los pedidos.")).toBeTruthy();
  });
});
