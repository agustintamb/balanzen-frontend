import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { favoritesService } from "@/api/favorites/favorites.service";
import type {
  Favorite,
  FavoriteListResponse,
  FavoritesParams,
} from "@/api/favorites/favorites.types";
import type { Pagination } from "@/api/shared.types";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/useFavorites";

jest.mock("@/api/favorites/favorites.service", () => ({
  favoritesService: {
    list: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockedFavoritesService = favoritesService as jest.Mocked<
  typeof favoritesService
>;

// ── fixtures ──────────────────────────────────────────────────────────────────

const mockPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 1,
  total_pages: 1,
};

const buildFavorite = (overrides?: Partial<Favorite>): Favorite => ({
  id: "fav-uuid-001",
  publication: {
    id: "pub-uuid-001",
    title: "Pan integral con semillas",
    original_price: 500,
    final_price: 250,
    discount_pct: 50,
    photos: ["https://cdn.example.com/photos/pan.jpg"],
    status: "ACTIVE",
    commerce: {
      business_name: "La Panadería",
      selected_address: {
        formatted_address: "Av. Corrientes 1234, Buenos Aires",
      },
    },
  },
  created_at: "2026-05-30T09:00:00.000Z",
  ...overrides,
});

const buildListResponse = (
  overrides?: Partial<FavoriteListResponse>
): FavoriteListResponse => ({
  favorites: [buildFavorite()],
  pagination: mockPagination,
  ...overrides,
});

// ── helpers ───────────────────────────────────────────────────────────────────

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { Wrapper, queryClient };
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe("useFavorites", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("useFavorites", () => {
    it("should return favorites list on successful fetch", async () => {
      const { Wrapper } = createWrapper();
      const response = buildListResponse();
      mockedFavoritesService.list.mockResolvedValueOnce(response);

      const { result } = renderHook(() => useFavorites(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(response);
      expect(result.current.data?.favorites).toHaveLength(1);
    });

    it("should call favoritesService.list with undefined params when no params are passed", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.list.mockResolvedValueOnce(buildListResponse());

      renderHook(() => useFavorites(), { wrapper: Wrapper });

      await waitFor(() =>
        expect(mockedFavoritesService.list).toHaveBeenCalledWith(undefined)
      );
    });

    it("should call favoritesService.list with pagination params when provided", async () => {
      const { Wrapper } = createWrapper();
      const params: FavoritesParams = { page: 2, limit: 10 };
      mockedFavoritesService.list.mockResolvedValueOnce(buildListResponse());

      renderHook(() => useFavorites(params), { wrapper: Wrapper });

      await waitFor(() =>
        expect(mockedFavoritesService.list).toHaveBeenCalledWith(params)
      );
    });

    it("should use queryKey ['favorites', params]", async () => {
      const { Wrapper, queryClient } = createWrapper();
      const params: FavoritesParams = { page: 1, limit: 20 };
      mockedFavoritesService.list.mockResolvedValueOnce(buildListResponse());

      renderHook(() => useFavorites(params), { wrapper: Wrapper });

      await waitFor(() =>
        expect(queryClient.getQueryState(["favorites", params])).toBeDefined()
      );
    });

    it("should set isError to true and expose the error when the service rejects", async () => {
      const { Wrapper } = createWrapper();
      const error = new Error("Network Error");
      mockedFavoritesService.list.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useFavorites(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Network Error");
    });

    it("should return empty favorites array when the user has no favorites", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.list.mockResolvedValueOnce(
        buildListResponse({ favorites: [], pagination: { ...mockPagination, total: 0 } })
      );

      const { result } = renderHook(() => useFavorites(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.favorites).toHaveLength(0);
    });

    it("should start in loading state before data resolves", () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.list.mockImplementation(
        () => new Promise(() => undefined)
      );

      const { result } = renderHook(() => useFavorites(), { wrapper: Wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should return pagination metadata with the response", async () => {
      const { Wrapper } = createWrapper();
      const pagination: Pagination = { page: 2, limit: 5, total: 15, total_pages: 3 };
      mockedFavoritesService.list.mockResolvedValueOnce(
        buildListResponse({ pagination })
      );

      const { result } = renderHook(() => useFavorites(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.pagination).toEqual(pagination);
    });
  });

  describe("useAddFavorite", () => {
    it("should call favoritesService.add with the publicationId on mutate", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.add.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedFavoritesService.add).toHaveBeenCalledWith("pub-uuid-001", expect.anything());
    });

    it("should call favoritesService.add exactly once per mutate call", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.add.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-002");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedFavoritesService.add).toHaveBeenCalledTimes(1);
    });

    it("should invalidate ['favorites'] queries on successful add", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedFavoritesService.add.mockResolvedValueOnce(undefined);
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["favorites"] });
    });

    it("should set isError to true when the service rejects", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.add.mockRejectedValueOnce(new Error("Conflict"));

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-001");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Conflict");
    });

    it("should not invalidate queries when the mutation fails", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedFavoritesService.add.mockRejectedValueOnce(new Error("Not Found"));
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      result.current.mutate("nonexistent-pub");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("should be in idle state before mutate is called", () => {
      const { Wrapper } = createWrapper();

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });

      expect(result.current.isIdle).toBe(true);
    });

    it("should pass the correct publicationId in the URL for a different id", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.add.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-999");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedFavoritesService.add).toHaveBeenCalledWith("pub-uuid-999", expect.anything());
    });
  });

  describe("useRemoveFavorite", () => {
    it("should call favoritesService.remove with the publicationId on mutate", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.remove.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRemoveFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedFavoritesService.remove).toHaveBeenCalledWith("pub-uuid-001", expect.anything());
    });

    it("should call favoritesService.remove exactly once per mutate call", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.remove.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRemoveFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedFavoritesService.remove).toHaveBeenCalledTimes(1);
    });

    it("should invalidate ['favorites'] queries on successful remove", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedFavoritesService.remove.mockResolvedValueOnce(undefined);
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["favorites"] });
    });

    it("should set isError to true when the service rejects with 404", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.remove.mockRejectedValueOnce(new Error("Not Found"));

      const { result } = renderHook(() => useRemoveFavorite(), { wrapper: Wrapper });
      result.current.mutate("nonexistent-pub");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Not Found");
    });

    it("should not invalidate queries when the remove mutation fails", async () => {
      const { Wrapper, queryClient } = createWrapper();
      mockedFavoritesService.remove.mockRejectedValueOnce(new Error("Unauthorized"));
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-001");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    it("should be in idle state before mutate is called", () => {
      const { Wrapper } = createWrapper();

      const { result } = renderHook(() => useRemoveFavorite(), { wrapper: Wrapper });

      expect(result.current.isIdle).toBe(true);
    });

    it("should pass the correct publicationId for a different id", async () => {
      const { Wrapper } = createWrapper();
      mockedFavoritesService.remove.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useRemoveFavorite(), { wrapper: Wrapper });
      result.current.mutate("pub-uuid-777");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedFavoritesService.remove).toHaveBeenCalledWith("pub-uuid-777", expect.anything());
    });
  });
});
