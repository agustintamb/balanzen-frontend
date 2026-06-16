import { Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { act, renderHook } from "@testing-library/react-native";
import type { Publication } from "@/api/publications/publications.types";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/useFavorites";
import { useCreateOrder } from "@/hooks/useOrders";
import { useDeletePublication, usePublication } from "@/hooks/usePublications";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";
import { usePublicationDetailScreen } from "../usePublicationDetailScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));
jest.mock("@/hooks/usePublications", () => ({
  usePublication: jest.fn(),
  useDeletePublication: jest.fn(),
}));
jest.mock("@/hooks/useOrders", () => ({ useCreateOrder: jest.fn() }));
jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
  useAddFavorite: jest.fn(),
  useRemoveFavorite: jest.fn(),
}));
jest.mock("@/stores/auth.store", () => ({ useAuthStore: jest.fn() }));
jest.mock("@/stores/ui.store", () => ({ useToast: jest.fn() }));

const CONSUMER = { id: "c1", role: "CONSUMIDOR" };
const COMMERCE = { id: "comm1", role: "COMERCIO" };

const buildPublication = (overrides: Partial<Publication> = {}): Publication =>
  ({
    id: "pub-1",
    title: "Mix de Verduras",
    description: "Frescas",
    original_price: 2400,
    final_price: 1200,
    discount_pct: 50,
    expiry_date: "2026-12-31T23:59:00Z",
    category: { id: "cat-1", name: "Verduras" },
    photos: ["https://img/1.jpg"],
    status: "ACTIVE",
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
    ...overrides,
  }) as Publication;

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockPush = jest.fn();
const mockCreateOrder = jest.fn();
const mockDelete = jest.fn();
const mockAddFavorite = jest.fn();
const mockRemoveFavorite = jest.fn();
const mockShowSuccess = jest.fn();
const mockRefetch = jest.fn().mockResolvedValue(undefined);

interface SetupOptions {
  user?: typeof CONSUMER | typeof COMMERCE;
  publication?: Publication;
  favorites?: { publication: { id: string } }[];
}

const setup = ({
  user = CONSUMER,
  publication = buildPublication(),
  favorites = [],
}: SetupOptions = {}) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: "pub-1" });
  (useRouter as jest.Mock).mockReturnValue({
    replace: mockReplace,
    back: mockBack,
    push: mockPush,
  });
  (usePublication as jest.Mock).mockReturnValue({
    data: publication,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    isRefetching: false,
  });
  (useFavorites as jest.Mock).mockReturnValue({ data: { favorites } });
  (useAddFavorite as jest.Mock).mockReturnValue({ mutate: mockAddFavorite });
  (useRemoveFavorite as jest.Mock).mockReturnValue({
    mutate: mockRemoveFavorite,
  });
  (useCreateOrder as jest.Mock).mockReturnValue({
    mutateAsync: mockCreateOrder,
    isPending: false,
  });
  (useDeletePublication as jest.Mock).mockReturnValue({
    mutateAsync: mockDelete,
    isPending: false,
  });
  (useAuthStore as unknown as jest.Mock).mockImplementation((selector: any) =>
    selector({ user }),
  );
  (useToast as jest.Mock).mockReturnValue({ showSuccess: mockShowSuccess });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateOrder.mockResolvedValue({ id: "order-9" });
  mockDelete.mockResolvedValue(undefined);
});

describe("usePublicationDetailScreen", () => {
  describe("consumer + ACTIVE", () => {
    it("shows reserve footer, favorite/share, and commerce as counterpart", () => {
      setup();
      const { result } = renderHook(() => usePublicationDetailScreen());
      expect(result.current.footerKind).toBe("reserve");
      expect(result.current.showFavoriteShare).toBe(true);
      expect(result.current.counterpart?.title).toBe("Verdulería Natura");
      expect(result.current.counterpart?.chatEnabled).toBe(false);
    });

    it("reserves and replaces to the order detail on confirm", async () => {
      setup();
      const { result } = renderHook(() => usePublicationDetailScreen());
      await act(async () => {
        await result.current.confirmReserve();
      });
      expect(mockCreateOrder).toHaveBeenCalledWith("pub-1");
      expect(mockReplace).toHaveBeenCalledWith("/order/order-9");
    });
  });

  describe("commerce owner + ACTIVE", () => {
    it("shows commerce footer and no favorite/share", () => {
      setup({ user: COMMERCE });
      const { result } = renderHook(() => usePublicationDetailScreen());
      expect(result.current.footerKind).toBe("commerce");
      expect(result.current.showFavoriteShare).toBe(false);
      expect(result.current.counterpart?.title).toBe("Sin reserva aún");
    });

    it("deletes and navigates back on confirm", async () => {
      setup({ user: COMMERCE });
      const { result } = renderHook(() => usePublicationDetailScreen());
      await act(async () => {
        await result.current.confirmDelete();
      });
      expect(mockDelete).toHaveBeenCalledWith("pub-1");
      expect(mockShowSuccess).toHaveBeenCalled();
      expect(mockBack).toHaveBeenCalled();
    });

    it("navigates to the edit screen", () => {
      setup({ user: COMMERCE });
      const { result } = renderHook(() => usePublicationDetailScreen());
      act(() => result.current.handleEdit());
      expect(mockPush).toHaveBeenCalledWith("/publish-product/pub-1");
    });
  });

  describe("non-active publication", () => {
    it("has no footer when DELIVERED", () => {
      setup({ publication: buildPublication({ status: "DELIVERED" }) });
      const { result } = renderHook(() => usePublicationDetailScreen());
      expect(result.current.footerKind).toBe("none");
    });
  });

  describe("ui handlers", () => {
    it("toggles the action sheets, goes back and refreshes", () => {
      setup({ user: COMMERCE });
      const { result } = renderHook(() => usePublicationDetailScreen());

      act(() => result.current.handleReservePress());
      expect(result.current.reserveVisible).toBe(true);
      act(() => result.current.handleCloseReserve());
      expect(result.current.reserveVisible).toBe(false);

      act(() => result.current.handleDeletePress());
      expect(result.current.deleteVisible).toBe(true);
      act(() => result.current.handleCloseDelete());
      expect(result.current.deleteVisible).toBe(false);

      act(() => result.current.handleBack());
      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe("favorites", () => {
    it("adds a favorite when not favorited", () => {
      setup();
      const { result } = renderHook(() => usePublicationDetailScreen());
      act(() => result.current.handleToggleFavorite());
      expect(mockAddFavorite).toHaveBeenCalledWith("pub-1");
    });

    it("removes a favorite when already favorited", () => {
      setup({ favorites: [{ publication: { id: "pub-1" } }] });
      const { result } = renderHook(() => usePublicationDetailScreen());
      expect(result.current.isFavorite).toBe(true);
      act(() => result.current.handleToggleFavorite());
      expect(mockRemoveFavorite).toHaveBeenCalledWith("pub-1");
    });
  });

  describe("share", () => {
    it("invokes the native share sheet", async () => {
      setup();
      const shareSpy = jest
        .spyOn(Share, "share")
        .mockResolvedValue({ action: "sharedAction" } as never);
      const { result } = renderHook(() => usePublicationDetailScreen());
      await act(async () => {
        await result.current.handleShare();
      });
      expect(shareSpy).toHaveBeenCalled();
      shareSpy.mockRestore();
    });
  });

  describe("error branches", () => {
    it("closes the reserve sheet without navigating when reserve fails", async () => {
      setup();
      mockCreateOrder.mockRejectedValueOnce(new Error("conflict"));
      const { result } = renderHook(() => usePublicationDetailScreen());
      await act(async () => {
        await result.current.confirmReserve();
      });
      expect(mockReplace).not.toHaveBeenCalled();
      expect(result.current.reserveVisible).toBe(false);
    });

    it("closes the delete sheet without navigating when delete fails", async () => {
      setup({ user: COMMERCE });
      mockDelete.mockRejectedValueOnce(new Error("fail"));
      const { result } = renderHook(() => usePublicationDetailScreen());
      await act(async () => {
        await result.current.confirmDelete();
      });
      expect(mockBack).not.toHaveBeenCalled();
      expect(result.current.deleteVisible).toBe(false);
    });
  });

  describe("route param", () => {
    it("falls back to an empty id when the param is missing", () => {
      setup();
      (useLocalSearchParams as jest.Mock).mockReturnValue({});
      const { result } = renderHook(() => usePublicationDetailScreen());
      expect(result.current.publication).toBeDefined();
    });
  });

  describe("without a loaded publication", () => {
    it("has no counterpart/footer and share is a no-op", async () => {
      setup();
      (usePublication as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
        isRefetching: false,
      });
      const shareSpy = jest.spyOn(Share, "share");
      const { result } = renderHook(() => usePublicationDetailScreen());
      expect(result.current.counterpart).toBeNull();
      expect(result.current.footerKind).toBe("none");
      expect(result.current.infoItems).toEqual([]);
      await act(async () => {
        await result.current.handleShare();
      });
      expect(shareSpy).not.toHaveBeenCalled();
      shareSpy.mockRestore();
    });
  });
});
