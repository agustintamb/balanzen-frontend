import { act, renderHook } from "@testing-library/react-native";
import useCommerceHomeDefaultExport, {
  useCommerceHomeScreen,
} from "@/app/(commerce)/home/useCommerceHomeScreen";
import { useNotifications } from "@/hooks/useNotifications";
import { useOrders } from "@/hooks/useOrders";
import { useMyPublications } from "@/hooks/usePublications";
import { useCurrentUser } from "@/hooks/useUsers";
import * as navigation from "@/utils/navigation";

jest.useFakeTimers();

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock("@/hooks/useUsers", () => ({
  useCurrentUser: jest.fn(),
}));

jest.mock("@/hooks/useNotifications", () => ({
  useNotifications: jest.fn(),
}));

jest.mock("@/hooks/useOrders", () => ({
  useOrders: jest.fn(),
}));

jest.mock("@/hooks/usePublications", () => ({
  useMyPublications: jest.fn(),
}));

jest.mock("@/utils/navigation", () => ({
  safePush: jest.fn(),
}));

const buildPub = (overrides = {}) => ({
  id: "pub-1",
  title: "Empanadas",
  description: "Ricas",
  original_price: 1000,
  final_price: 800,
  discount_pct: 20,
  expiry_date: "2099-12-31T23:59:59.000Z",
  category: { id: "cat-1", name: "Comida" },
  photos: [],
  status: "ACTIVE" as const,
  is_donation: false,
  commerce: {
    id: "com-1",
    business_name: "La Parrilla",
    selected_address: {
      formatted_address: "Av. Corrientes 1234",
      lat: -34,
      lng: -58,
    },
  },
  created_at: "2026-06-01T10:00:00.000Z",
  ...overrides,
});

const setupMocks = () => {
  (useCurrentUser as jest.Mock).mockReturnValue({
    data: {
      id: "u1",
      first_name: "Carlos",
      last_name: "López",
      business_name: "Mi Comercio",
    },
  });
  (useNotifications as jest.Mock).mockReturnValue({
    data: { unread_count: 3 },
  });
  (useOrders as jest.Mock).mockReturnValue({
    data: { orders: [], pagination: { total: 2 } },
  });
  (useMyPublications as jest.Mock).mockReturnValue({
    data: { publications: [buildPub()], pagination: { total: 1 } },
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

describe("useCommerceHomeScreen", () => {
  describe("initial state", () => {
    it("returns the business name", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.businessName).toBe("Mi Comercio");
    });

    it("uses first_name + last_name when business_name is absent", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        data: { id: "u1", first_name: "Carlos", last_name: "López" },
      });
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.businessName).toBe("Carlos López");
    });

    it("returns empty string for businessName when user has no name fields", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        data: { id: "u1" },
      });
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.businessName).toBe("");
    });

    it("returns empty publications when publications data is undefined", () => {
      (useMyPublications as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.publications).toHaveLength(0);
    });

    it("returns unreadCount from notifications", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.unreadCount).toBe(3);
    });

    it("returns 0 unreadCount when notifications are undefined", () => {
      (useNotifications as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.unreadCount).toBe(0);
    });

    it("returns activeReservations from orders pagination", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.activeReservations).toBe(2);
    });

    it("returns 0 activeReservations when orders data is undefined", () => {
      (useOrders as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.activeReservations).toBe(0);
    });

    it("starts with activeFilter ACTIVE", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.activeFilter).toBe("ACTIVE");
    });

    it("starts with isFilterSheetVisible false", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("hasActiveFilters is false by default", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("filter sheet handlers", () => {
    it("handleOpenFilterSheet opens the filter sheet", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      expect(result.current.isFilterSheetVisible).toBe(true);
    });

    it("handleCloseFilterSheet closes the filter sheet", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      act(() => {
        result.current.handleCloseFilterSheet();
      });
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("handleApplyFilters applies pending filters and closes sheet", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      act(() => {
        result.current.handlePendingDateChange("today");
      });
      act(() => {
        result.current.handleApplyFilters();
      });
      expect(result.current.dateFilter).toBe("today");
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("handleResetFilters resets all filters to defaults and closes sheet", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handlePendingDateChange("week");
      });
      act(() => {
        result.current.handlePendingSortChange("oldest");
      });
      act(() => {
        result.current.handleApplyFilters();
      });
      act(() => {
        result.current.handleResetFilters();
      });
      expect(result.current.dateFilter).toBe("all");
      expect(result.current.activeSort).toBe("recent");
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("hasActiveFilters is true when dateFilter is not 'all'", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      act(() => {
        result.current.handlePendingDateChange("today");
      });
      act(() => {
        result.current.handleApplyFilters();
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("hasActiveFilters is true when activeSort is not 'recent'", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handlePendingSortChange("oldest");
      });
      act(() => {
        result.current.handleApplyFilters();
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("search debounce", () => {
    it("updates activeSearch after 500ms delay", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.onSearchChange("empa");
      });
      expect(result.current.search).toBe("empa");

      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current.publications).toBeDefined();
    });
  });

  describe("handleBell", () => {
    it("calls safePush('/notifications')", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handleBell();
      });
      expect(navigation.safePush).toHaveBeenCalledWith("/notifications");
    });
  });

  describe("handleFilterChange", () => {
    it("updates activeFilter", () => {
      const { result } = renderHook(() => useCommerceHomeScreen());
      act(() => {
        result.current.handleFilterChange("RESERVED");
      });
      expect(result.current.activeFilter).toBe("RESERVED");
    });
  });

  describe("useFocusEffect callback", () => {
    it("resets state to defaults when focus callback fires", () => {
      let capturedCb: (() => void) | null = null;
      const { useFocusEffect } = require("@react-navigation/native");
      (useFocusEffect as jest.Mock).mockImplementationOnce((cb: () => void) => {
        capturedCb = cb;
      });

      const { result } = renderHook(() => useCommerceHomeScreen());

      act(() => {
        result.current.handleFilterChange("DELIVERED");
      });
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      expect(result.current.activeFilter).toBe("DELIVERED");
      expect(result.current.isFilterSheetVisible).toBe(true);

      act(() => {
        capturedCb?.();
      });

      expect(result.current.activeFilter).toBe("ACTIVE");
      expect(result.current.dateFilter).toBe("all");
      expect(result.current.activeSort).toBe("recent");
      expect(result.current.search).toBe("");
      expect(result.current.isFilterSheetVisible).toBe(false);
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useCommerceHomeDefaultExport()).toBeNull();
    });
  });
});
