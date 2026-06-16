import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { useOrders } from "@/hooks/useOrders";
import { safePush } from "@/utils/navigation";
import ConsumerOrders from "../index";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ bottom: 0 }),
}));
jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAvoidingView: ({ children }: any) => children,
}));
jest.mock("@/hooks/useOrders", () => ({ useOrders: jest.fn() }));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("@/components/FilterSheet", () => {
  const {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
  } = require("react-native");
  function MockFilterSheet({
    visible,
    title = "Filtros",
    onClose,
    onReset,
    onApply,
    children,
  }: any) {
    if (!visible) return null;
    return (
      <View testID="filter-sheet">
        <TouchableWithoutFeedback
          onPress={onClose}
          testID="filter-sheet-backdrop"
        >
          <View />
        </TouchableWithoutFeedback>
        <Text>{title}</Text>
        <TouchableOpacity onPress={onReset} testID="filter-sheet-reset">
          <Text>Restablecer</Text>
        </TouchableOpacity>
        {children}
        <TouchableOpacity onPress={onApply} testID="filter-sheet-apply">
          <Text>Aplicar filtros</Text>
        </TouchableOpacity>
      </View>
    );
  }
  function MockFilterSection({ title, children }: any) {
    return (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    );
  }
  function MockFilterOptions({ options, onSelect }: any) {
    return options.map((opt: any) => (
      <TouchableOpacity key={opt.key} onPress={() => onSelect(opt.key)}>
        <Text>{opt.label}</Text>
      </TouchableOpacity>
    ));
  }
  return {
    __esModule: true,
    default: MockFilterSheet,
    FilterSection: MockFilterSection,
    FilterOptionChips: MockFilterOptions,
    FilterOptionList: MockFilterOptions,
  };
});

jest.mock("@/components/OrderCard/OrderCard", () => {
  const { Text, TouchableOpacity } = require("react-native");
  function MockOrderCard({ order, onPress }: any) {
    return (
      <TouchableOpacity
        testID={`order-${order.id}`}
        onPress={() => onPress?.(order.id)}
      >
        <Text>{order.publication.title}</Text>
      </TouchableOpacity>
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

  it("opens the filter sheet when filter button is pressed", () => {
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

  it("applies filters and closes the sheet when Aplicar is pressed", () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <ConsumerOrders />,
    );
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Hoy"));
    fireEvent.press(getByTestId("filter-sheet-apply"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("resets pending filters when Restablecer is pressed", () => {
    const { getByTestId, queryByTestId } = render(<ConsumerOrders />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByTestId("filter-sheet")).toBeTruthy();
    fireEvent.press(getByTestId("filter-sheet-reset"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("closes the filter sheet when backdrop is pressed", () => {
    const { getByTestId, queryByTestId } = render(<ConsumerOrders />);
    fireEvent.press(getByTestId("btn-filter"));
    expect(getByTestId("filter-sheet")).toBeTruthy();
    fireEvent.press(getByTestId("filter-sheet-backdrop"));
    expect(queryByTestId("filter-sheet")).toBeNull();
  });

  it("shows empty state when there are no orders", () => {
    mockUseOrders({ orders: [] });
    const { getByText } = render(<ConsumerOrders />);
    expect(getByText("No tenés pedidos activos.")).toBeTruthy();
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

  it("shows order count when not loading", () => {
    const { getByText } = render(<ConsumerOrders />);
    expect(getByText(/pedidos en total|pedido en total/)).toBeTruthy();
  });

  it("shows loading indicator when isLoading is true", () => {
    mockUseOrders({ isLoading: true, orders: [] });
    const { queryByText, UNSAFE_getAllByType } = render(<ConsumerOrders />);
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_getAllByType(ActivityIndicator)).toHaveLength(1);
    expect(queryByText("No tenés pedidos activos.")).toBeNull();
  });

  it("renders separator component with multiple orders", () => {
    const order1 = {
      id: "order-1",
      status: "RESERVED",
      created_at: "2026-01-01",
      unread_count: 0,
      publication: {
        id: "pub-1",
        title: "Pizza",
        final_price: 1000,
        photos: [],
      },
      commerce: {
        id: "c-1",
        business_name: "Pizzería",
        selected_address: { formatted_address: "Corrientes 1234" },
      },
      consumer: { id: "u-1", first_name: "Ana", last_name: "Pérez" },
    };
    const order2 = {
      ...order1,
      id: "order-2",
      publication: { ...order1.publication, id: "pub-2", title: "Empanadas" },
    };
    mockUseOrders({ orders: [order1, order2] });
    const { getByTestId } = render(<ConsumerOrders />);
    expect(getByTestId("order-order-1")).toBeTruthy();
    expect(getByTestId("order-order-2")).toBeTruthy();
  });

  it("navigates to the order detail when a card is pressed", () => {
    const order1 = {
      id: "order-1",
      status: "RESERVED",
      created_at: "2026-01-01",
      unread_count: 0,
      publication: {
        id: "pub-1",
        title: "Pizza",
        final_price: 1000,
        photos: [],
      },
      commerce: {
        id: "c-1",
        business_name: "Pizzería",
        selected_address: { formatted_address: "Corrientes 1234" },
      },
      consumer: { id: "u-1", first_name: "Ana", last_name: "Pérez" },
    };
    mockUseOrders({ orders: [order1] });
    const { getByTestId } = render(<ConsumerOrders />);
    fireEvent.press(getByTestId("order-order-1"));
    expect(safePush).toHaveBeenCalledWith("/order/order-1");
  });

  it("shows 'no delivered orders' text when filter is DELIVERED and no results", () => {
    mockUseOrders({ orders: [] });
    const { getByText } = render(<ConsumerOrders />);
    fireEvent.press(getByText("Entregados"));
    expect(getByText("No tenés pedidos entregados.")).toBeTruthy();
  });

  it("shows 'no cancelled orders' text when filter is CANCELLED and no results", () => {
    mockUseOrders({ orders: [] });
    const { getByText } = render(<ConsumerOrders />);
    fireEvent.press(getByText("Cancelados"));
    expect(getByText("No tenés pedidos cancelados.")).toBeTruthy();
  });

  it("shows 'no orders' text when filter is 'all' and no results", () => {
    mockUseOrders({ orders: [] });
    const { getByText } = render(<ConsumerOrders />);
    fireEvent.press(getByText("Todos"));
    expect(getByText("Todavía no tenés pedidos.")).toBeTruthy();
  });

  it("shows search empty text when a search term is entered", () => {
    mockUseOrders({ orders: [] });
    const { getByText, getByPlaceholderText } = render(<ConsumerOrders />);
    fireEvent.changeText(getByPlaceholderText("Buscar pedidos..."), "pizza");
    expect(
      getByText("No hay pedidos que coincidan con tu búsqueda."),
    ).toBeTruthy();
  });

  it("shows date-filter empty text when date filter is applied", () => {
    mockUseOrders({ orders: [] });
    const { getByText, getByTestId } = render(<ConsumerOrders />);
    fireEvent.press(getByTestId("btn-filter"));
    fireEvent.press(getByText("Hoy"));
    fireEvent.press(getByTestId("filter-sheet-apply"));
    expect(getByText("No tenés pedidos en ese período.")).toBeTruthy();
  });
});
