import { act, renderHook } from "@testing-library/react-native";
import { useCategories } from "@/hooks/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { usePublications } from "@/hooks/usePublications";
import { useCurrentUser } from "@/hooks/useUsers";
import * as navigation from "@/utils/navigation";
import useConsumerHomeDefaultExport, {
  useConsumerHomeScreen,
} from "@/app/(consumer)/home/useConsumerHomeScreen";

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

jest.mock("@/hooks/useCategories", () => ({
  useCategories: jest.fn(),
}));

jest.mock("@/hooks/usePublications", () => ({
  usePublications: jest.fn(),
}));

jest.mock("@/utils/navigation", () => ({
  safePush: jest.fn(),
}));

const buildPub = (overrides = {}) => ({
  id: "pub-1",
  title: "Pizza",
  description: "Clásica",
  original_price: 2000,
  final_price: 1400,
  discount_pct: 30,
  expiry_date: "2099-12-31T23:59:59.000Z",
  category: { id: "cat-1", name: "Comida" },
  photos: [],
  status: "ACTIVE" as const,
  is_donation: false,
  commerce: {
    id: "com-1",
    business_name: "La Parrilla",
    selected_address: { formatted_address: "Av. Corrientes 1234", lat: -34, lng: -58 },
  },
  created_at: "2026-06-01T10:00:00.000Z",
  ...overrides,
});

const setupMocks = () => {
  (useCurrentUser as jest.Mock).mockReturnValue({
    data: {
      id: "u1",
      first_name: "Ana",
      last_name: "Pérez",
      selected_address: {
        lat: -34.6,
        lng: -58.4,
        formatted_address: "Av. Corrientes 1234",
      },
    },
  });
  (useNotifications as jest.Mock).mockReturnValue({
    data: { unread_count: 2 },
  });
  (useCategories as jest.Mock).mockReturnValue({
    data: [{ id: "cat-1", name: "Comida" }],
  });
  (usePublications as jest.Mock).mockReturnValue({
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

describe("useConsumerHomeScreen", () => {
  describe("initial state", () => {
    it("returns first name from user", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.firstName).toBe("Ana");
    });

    it("returns empty string when user is undefined", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.firstName).toBe("");
    });

    it("returns selected address formatted", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.selectedAddress).toBe("Av. Corrientes 1234");
    });

    it("returns null selectedAddress when user has no selected_address", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        data: { id: "u1", first_name: "Ana", last_name: "Pérez" },
      });
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.selectedAddress).toBeNull();
    });

    it("returns unreadCount from notifications", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.unreadCount).toBe(2);
    });

    it("starts with selectedCategory 'all'", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.selectedCategory).toBe("all");
    });

    it("starts with isFilterSheetVisible false", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("hasLatLng is true when user has coordinates", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.hasLatLng).toBe(true);
    });

    it("hasLatLng is false when user has no coordinates", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        data: { id: "u1", first_name: "Ana" },
      });
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.hasLatLng).toBe(false);
    });

    it("returns 0 unreadCount when notifications is undefined", () => {
      (useNotifications as jest.Mock).mockReturnValue({ data: undefined });
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.unreadCount).toBe(0);
    });

    it("returns empty publications array when publications data is undefined", () => {
      (usePublications as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.publications).toHaveLength(0);
    });

    it("returns publications", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.publications).toHaveLength(1);
    });

    it("hasActiveFilters is false by default", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe("filter sheet", () => {
    it("handleOpenFilterSheet opens the sheet", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      expect(result.current.isFilterSheetVisible).toBe(true);
    });

    it("handleCloseFilterSheet closes the sheet", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      act(() => {
        result.current.handleCloseFilterSheet();
      });
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("handleApplyFilters applies pending filters", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => { result.current.handleOpenFilterSheet(); });
      act(() => { result.current.handlePendingPubTypeChange("donation"); });
      act(() => { result.current.handleApplyFilters(); });
      expect(result.current.pendingPubType).toBe("donation");
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("handleResetFilters resets all filters", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => { result.current.handlePendingPubTypeChange("discount"); });
      act(() => { result.current.handleApplyFilters(); });
      act(() => { result.current.handleResetFilters(); });
      expect(result.current.pendingPubType).toBe("all");
      expect(result.current.pendingMaxRadius).toBe("any");
      expect(result.current.pendingSortBy).toBe("distance");
      expect(result.current.isFilterSheetVisible).toBe(false);
    });

    it("hasActiveFilters is true when pubType filter changes from default", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => { result.current.handlePendingPubTypeChange("donation"); });
      act(() => { result.current.handleApplyFilters(); });
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("handleBell", () => {
    it("calls safePush('/notifications')", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => {
        result.current.handleBell();
      });
      expect(navigation.safePush).toHaveBeenCalledWith("/notifications");
    });
  });

  describe("handleCategoryChange", () => {
    it("updates selectedCategory", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => {
        result.current.handleCategoryChange("cat-1");
      });
      expect(result.current.selectedCategory).toBe("cat-1");
    });
  });

  describe("search debounce", () => {
    it("updates search immediately but debounces the query", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => {
        result.current.onSearchChange("pizza");
      });
      expect(result.current.search).toBe("pizza");
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current.publications).toBeDefined();
    });
  });

  describe("categoryFilters", () => {
    it("includes 'Todas' as the first filter", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.categoryFilters[0].key).toBe("all");
      expect(result.current.categoryFilters[0].label).toBe("Todas");
    });

    it("includes categories from API", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      expect(result.current.categoryFilters).toHaveLength(2);
    });
  });

  describe("hasActiveFilters branches", () => {
    it("is true when maxRadius changes from default", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => {
        result.current.handlePendingMaxRadiusChange("3");
      });
      act(() => {
        result.current.handleApplyFilters();
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });

    it("is true when sortBy changes from default", () => {
      const { result } = renderHook(() => useConsumerHomeScreen());
      act(() => {
        result.current.handlePendingSortByChange("discount_pct");
      });
      act(() => {
        result.current.handleApplyFilters();
      });
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });

  describe("useFocusEffect callback", () => {
    it("resets state to defaults when focus callback fires", () => {
      let capturedCb: (() => void) | null = null;
      const { useFocusEffect } = require("@react-navigation/native");
      (useFocusEffect as jest.Mock).mockImplementationOnce(
        (cb: () => void) => {
          capturedCb = cb;
        },
      );

      const { result } = renderHook(() => useConsumerHomeScreen());

      act(() => {
        result.current.handleCategoryChange("cat-1");
      });
      act(() => {
        result.current.handleOpenFilterSheet();
      });
      expect(result.current.selectedCategory).toBe("cat-1");
      expect(result.current.isFilterSheetVisible).toBe(true);

      act(() => {
        capturedCb?.();
      });

      expect(result.current.search).toBe("");
      expect(result.current.selectedCategory).toBe("all");
      expect(result.current.isFilterSheetVisible).toBe(false);
      expect(result.current.pendingPubType).toBe("all");
      expect(result.current.pendingMaxRadius).toBe("any");
      expect(result.current.pendingSortBy).toBe("distance");
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useConsumerHomeDefaultExport()).toBeNull();
    });
  });
});
