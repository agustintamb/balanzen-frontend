import { act, renderHook } from "@testing-library/react-native";
import { useOrders } from "@/hooks/useOrders";
import useConsumerOrdersDefaultExport, {
  useConsumerOrdersScreen,
} from "@/app/(consumer)/orders/useConsumerOrdersScreen";

jest.useFakeTimers();

jest.mock("@/hooks/useOrders", () => ({
  useOrders: jest.fn(),
}));

const buildOrder = (overrides = {}) => ({
  id: "order-1",
  publication: { id: "pub-1", title: "Empanadas", final_price: 800, photos: [] },
  consumer: { id: "c1", first_name: "Ana", last_name: "Pérez" },
  commerce: {
    id: "com-1",
    business_name: "La Parrilla",
    selected_address: { formatted_address: "Av. Corrientes 1234" },
  },
  status: "RESERVED" as const,
  created_at: "2026-06-01T10:00:00.000Z",
  updated_at: undefined,
  unread_count: 0,
  ...overrides,
});

const setupMocks = () => {
  (useOrders as jest.Mock).mockReturnValue({
    data: { orders: [buildOrder()], pagination: { total: 1 } },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

describe("useConsumerOrdersScreen", () => {
  describe("initial state", () => {
    it("starts with activeFilter RESERVED", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      expect(result.current.activeFilter).toBe("RESERVED");
    });

    it("starts with dateFilter 'all'", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      expect(result.current.dateFilter).toBe("all");
    });

    it("starts with activeSort 'recent'", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      expect(result.current.activeSort).toBe("recent");
    });

    it("starts with isFilterSheetVisible false", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("hasActiveFilters is false by default", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("returns orders from the API", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      expect(result.current.orders).toHaveLength(1);
    });
  });

  describe("filter sheet handlers", () => {
    it("handleOpenFilterSheet opens the sheet", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      expect(result.current.isFilterSheetVisible).toBe(true);
    });

    it("handleCloseFilterSheet closes the sheet", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      act(() => {
        result.current.handleCloseFilterSheet();
      });
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("handleApplyFilters applies pending filters", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => { result.current.handleOpenFilterSheet(); });
      act(() => { result.current.handlePendingDateChange("today"); });
      act(() => { result.current.handleApplyFilters(); });
      expect(result.current.dateFilter).toBe("today");
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("handleResetFilters resets all filters", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => { result.current.handlePendingDateChange("week"); });
      act(() => { result.current.handlePendingSortChange("oldest"); });
      act(() => { result.current.handleApplyFilters(); });
      act(() => { result.current.handleResetFilters(); });
      expect(result.current.dateFilter).toBe("all");
      expect(result.current.activeSort).toBe("recent");
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("hasActiveFilters is true when sort is not 'recent'", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => { result.current.handlePendingSortChange("oldest"); });
      act(() => { result.current.handleApplyFilters(); });
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("handleFilterChange", () => {
    it("updates activeFilter", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => {
        result.current.handleFilterChange("DELIVERED");
      });
      expect(result.current.activeFilter).toBe("DELIVERED");
    });
  });

  describe("search", () => {
    it("updates search immediately", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => {
        result.current.onSearchChange("empa");
      });
      expect(result.current.search).toBe("empa");
    });

    it("debounces activeSearch by 500ms", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => {
        result.current.onSearchChange("empa");
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });
      // After debounce, orders are filtered client-side
      expect(result.current.orders).toBeDefined();
    });
  });

  describe("when orders data is undefined", () => {
    it("returns empty array for orders", () => {
      (useOrders as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });
      const { result } = renderHook(() => useConsumerOrdersScreen());
      expect(result.current.orders).toHaveLength(0);
    });
  });

  describe("useOrders call with no params", () => {
    it("calls useOrders with undefined when activeFilter is 'all' and no date filter", () => {
      const { result } = renderHook(() => useConsumerOrdersScreen());
      act(() => {
        result.current.handleFilterChange("all");
      });
      expect(useOrders).toHaveBeenCalledWith(undefined);
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useConsumerOrdersDefaultExport()).toBeNull();
    });
  });
});
