import { Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { act, renderHook } from "@testing-library/react-native";
import type { OrderDetail } from "@/api/orders/orders.types";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/useFavorites";
import { useCancelOrder, useDeliverOrder, useOrder } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";
import { useOrderDetailScreen } from "../useOrderDetailScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/useOrders", () => ({
  useOrder: jest.fn(),
  useCancelOrder: jest.fn(),
  useDeliverOrder: jest.fn(),
}));
jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
  useAddFavorite: jest.fn(),
  useRemoveFavorite: jest.fn(),
}));
jest.mock("@/stores/auth.store", () => ({ useAuthStore: jest.fn() }));
jest.mock("@/stores/ui.store", () => ({ useToast: jest.fn() }));

const CONSUMER = { id: "c1", role: "CONSUMIDOR" };
const COMMERCE = { id: "comm1", role: "COMERCIO" };

const buildOrder = (overrides: Partial<OrderDetail> = {}): OrderDetail =>
  ({
    id: "order-1",
    status: "RESERVED",
    publication: {
      id: "pub-1",
      title: "Pack de Medialunas",
      description: "Frescas",
      original_price: 1600,
      final_price: 800,
      discount_pct: 50,
      expiry_date: "2026-12-31T23:59:00Z",
      category: { id: "cat-1", name: "Panadería" },
      photos: ["https://img/1.jpg"],
      status: "RESERVED",
      is_donation: false,
      commerce: {
        id: "comm1",
        business_name: "Verdulería Natura",
        selected_address: {
          formatted_address: "Av. Santa Fe 2150",
          lat: 0,
          lng: 0,
        },
      },
      created_at: "2026-01-01T00:00:00Z",
    },
    consumer: {
      id: "c1",
      first_name: "María",
      last_name: "Alejandra",
      photo_url: null,
    },
    commerce: {
      id: "comm1",
      business_name: "Verdulería Natura",
      selected_address: { formatted_address: "Av. Santa Fe 2150" },
    },
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  }) as OrderDetail;

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();
const mockCancel = jest.fn();
const mockDeliver = jest.fn();
const mockShowSuccess = jest.fn();
const mockAddFavorite = jest.fn();
const mockRemoveFavorite = jest.fn();

const setup = (
  user: typeof CONSUMER | typeof COMMERCE = COMMERCE,
  order: OrderDetail = buildOrder(),
  favorites: { publication: { id: string } }[] = [],
) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "order-1" });
  (useRouter as jest.Mock).mockReturnValue({
    replace: mockReplace,
    back: mockBack,
    push: mockPush,
  });
  (useOrder as jest.Mock).mockReturnValue({
    data: order,
    isLoading: false,
    isError: false,
  });
  (useFavorites as jest.Mock).mockReturnValue({ data: { favorites } });
  (useAddFavorite as jest.Mock).mockReturnValue({ mutate: mockAddFavorite });
  (useRemoveFavorite as jest.Mock).mockReturnValue({
    mutate: mockRemoveFavorite,
  });
  (useCancelOrder as jest.Mock).mockReturnValue({
    mutateAsync: mockCancel,
    isPending: false,
  });
  (useDeliverOrder as jest.Mock).mockReturnValue({
    mutateAsync: mockDeliver,
    isPending: false,
  });
  (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
    selector({ user }),
  );
  (useToast as jest.Mock).mockReturnValue({ showSuccess: mockShowSuccess });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCancel.mockResolvedValue(undefined);
  mockDeliver.mockResolvedValue(undefined);
});

describe("useOrderDetailScreen", () => {
  describe("commerce + RESERVED", () => {
    it("shows commerce actions and the consumer as counterpart with chat enabled", () => {
      setup(COMMERCE);
      const { result } = renderHook(() => useOrderDetailScreen());
      expect(result.current.footerKind).toBe("commerce-actions");
      expect(result.current.counterpart?.title).toBe("María Alejandra");
      expect(result.current.counterpart?.initials).toBe("MA");
      expect(result.current.counterpart?.chatEnabled).toBe(true);
      expect(result.current.showFavoriteShare).toBe(false);
    });

    it("delivers and shows the success overlay, then navigates home", async () => {
      setup(COMMERCE);
      const { result } = renderHook(() => useOrderDetailScreen());
      await act(async () => {
        await result.current.confirmDeliver();
      });
      expect(mockDeliver).toHaveBeenCalledWith("order-1");
      expect(result.current.successVisible).toBe(true);
      act(() => result.current.handleSuccessDone());
      expect(mockReplace).toHaveBeenCalledWith("/(commerce)/home");
    });
  });

  describe("consumer + RESERVED", () => {
    it("shows the cancel footer and the commerce as counterpart", () => {
      setup(CONSUMER);
      const { result } = renderHook(() => useOrderDetailScreen());
      expect(result.current.footerKind).toBe("consumer-cancel");
      expect(result.current.counterpart?.title).toBe("Verdulería Natura");
      expect(result.current.showFavoriteShare).toBe(true);
    });

    it("cancels and navigates back on confirm", async () => {
      setup(CONSUMER);
      const { result } = renderHook(() => useOrderDetailScreen());
      await act(async () => {
        await result.current.confirmCancel();
      });
      expect(mockCancel).toHaveBeenCalledWith("order-1");
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe("terminal status", () => {
    it("has no footer and disabled chat when DELIVERED", () => {
      setup(COMMERCE, buildOrder({ status: "DELIVERED" }));
      const { result } = renderHook(() => useOrderDetailScreen());
      expect(result.current.footerKind).toBe("none");
      expect(result.current.counterpart?.chatEnabled).toBe(false);
    });
  });

  describe("chat", () => {
    it("navigates to the chat route", () => {
      setup(COMMERCE);
      const { result } = renderHook(() => useOrderDetailScreen());
      act(() => result.current.handleChat());
      expect(mockPush).toHaveBeenCalledWith("/chat/order-1");
    });
  });

  describe("favorites and share (consumer)", () => {
    it("adds a favorite when not favorited", () => {
      setup(CONSUMER);
      const { result } = renderHook(() => useOrderDetailScreen());
      act(() => result.current.handleToggleFavorite());
      expect(mockAddFavorite).toHaveBeenCalledWith("pub-1");
    });

    it("removes a favorite when already favorited", () => {
      setup(CONSUMER, buildOrder(), [{ publication: { id: "pub-1" } }]);
      const { result } = renderHook(() => useOrderDetailScreen());
      expect(result.current.isFavorite).toBe(true);
      act(() => result.current.handleToggleFavorite());
      expect(mockRemoveFavorite).toHaveBeenCalledWith("pub-1");
    });

    it("invokes the native share sheet", async () => {
      setup(CONSUMER);
      const shareSpy = jest
        .spyOn(Share, "share")
        .mockResolvedValue({ action: "sharedAction" } as never);
      const { result } = renderHook(() => useOrderDetailScreen());
      await act(async () => {
        await result.current.handleShare();
      });
      expect(shareSpy).toHaveBeenCalled();
      shareSpy.mockRestore();
    });
  });
});
