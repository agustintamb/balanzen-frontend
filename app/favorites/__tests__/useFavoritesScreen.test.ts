import { act, renderHook } from "@testing-library/react-native";
import { useFavorites, useRemoveFavorite } from "@/hooks/useFavorites";
import useDefaultExport, { useFavoritesScreen } from "../useFavoritesScreen";

jest.mock("expo-router", () => ({ useRouter: jest.fn() }));

jest.mock("@/hooks/useFavorites", () => ({
  useFavorites: jest.fn(),
  useRemoveFavorite: jest.fn(),
}));

const mockBack = jest.fn();
const mockRemoveFavorite = jest.fn();
const mockRefetch = jest.fn();

const MOCK_DATA = {
  favorites: [
    { id: "f1", publication: { id: "p1" } },
    { id: "f2", publication: { id: "p2" } },
  ],
  pagination: { total: 2, page: 1, limit: 20 },
};

const setupMocks = (data = MOCK_DATA, isLoading = false) => {
  const { useRouter } = require("expo-router");
  (useRouter as jest.Mock).mockReturnValue({ back: mockBack });
  (useFavorites as jest.Mock).mockReturnValue({
    data,
    isLoading,
    isRefetching: false,
    refetch: mockRefetch,
  });
  (useRemoveFavorite as jest.Mock).mockReturnValue({
    mutate: mockRemoveFavorite,
    isPending: false,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  setupMocks();
});

describe("useFavoritesScreen", () => {
  describe("data derivation", () => {
    it("exposes favorites from data", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      expect(result.current.favorites).toHaveLength(2);
    });

    it("exposes total from pagination", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      expect(result.current.total).toBe(2);
    });

    it("defaults favorites to [] when data is undefined", () => {
      (useFavorites as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isRefetching: false,
        refetch: mockRefetch,
      });
      const { result } = renderHook(() => useFavoritesScreen());
      expect(result.current.favorites).toEqual([]);
    });

    it("defaults total to 0 when data is undefined", () => {
      (useFavorites as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
        isRefetching: false,
        refetch: mockRefetch,
      });
      const { result } = renderHook(() => useFavoritesScreen());
      expect(result.current.total).toBe(0);
    });

    it("exposes isLoading state", () => {
      (useFavorites as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
        isRefetching: false,
        refetch: mockRefetch,
      });
      const { result } = renderHook(() => useFavoritesScreen());
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("handleBack", () => {
    it("calls router.back()", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      act(() => {
        result.current.handleBack();
      });
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("pendingRemoveId", () => {
    it("starts as null", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      expect(result.current.pendingRemoveId).toBeNull();
    });

    it("handleRemove sets pendingRemoveId", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      act(() => {
        result.current.handleRemove("p1");
      });
      expect(result.current.pendingRemoveId).toBe("p1");
    });

    it("handleRemoveCancel clears pendingRemoveId", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      act(() => {
        result.current.handleRemove("p1");
      });
      act(() => {
        result.current.handleRemoveCancel();
      });
      expect(result.current.pendingRemoveId).toBeNull();
    });
  });

  describe("handleRemoveConfirm", () => {
    it("does nothing when pendingRemoveId is null", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      act(() => {
        result.current.handleRemoveConfirm();
      });
      expect(mockRemoveFavorite).not.toHaveBeenCalled();
    });

    it("calls removeFavorite with pendingRemoveId", () => {
      const { result } = renderHook(() => useFavoritesScreen());
      act(() => {
        result.current.handleRemove("p1");
      });
      act(() => {
        result.current.handleRemoveConfirm();
      });
      expect(mockRemoveFavorite).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("clears pendingRemoveId on success", () => {
      mockRemoveFavorite.mockImplementationOnce(
        (_id: string, { onSuccess }: any) => {
          onSuccess();
        },
      );
      const { result } = renderHook(() => useFavoritesScreen());
      act(() => {
        result.current.handleRemove("p1");
      });
      act(() => {
        result.current.handleRemoveConfirm();
      });
      expect(result.current.pendingRemoveId).toBeNull();
    });
  });

  describe("default export", () => {
    it("returns null — Expo Router required dummy export", () => {
      expect(useDefaultExport()).toBeNull();
    });
  });
});
