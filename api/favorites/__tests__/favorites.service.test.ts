import apiClient from "@/api/client";
import { favoritesService } from "@/api/favorites/favorites.service";
import type {
  Favorite,
  FavoriteListResponse,
  FavoritesParams,
} from "@/api/favorites/favorites.types";
import type { Pagination } from "@/api/shared.types";

jest.mock("@/api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// ── fixtures ──────────────────────────────────────────────────────────────────

const mockPagination: Pagination = {
  page: 1,
  limit: 20,
  total: 3,
  total_pages: 1,
};

const mockFavorite: Favorite = {
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
};

const mockFavoriteListResponse: FavoriteListResponse = {
  favorites: [mockFavorite],
  pagination: mockPagination,
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe("favoritesService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── list ───────────────────────────────────────────────────────────────────

  describe("list", () => {
    it("should call GET /favorites with undefined params when called without arguments", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockFavoriteListResponse);

      await favoritesService.list();

      expect(mockApiClient.get).toHaveBeenCalledWith("/favorites", {
        params: undefined,
      });
    });

    it("should call GET /favorites exactly once", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockFavoriteListResponse);

      await favoritesService.list();

      expect(mockApiClient.get).toHaveBeenCalledTimes(1);
    });

    it("should pass pagination params when provided", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockFavoriteListResponse);
      const params: FavoritesParams = { page: 2, limit: 10 };

      await favoritesService.list(params);

      expect(mockApiClient.get).toHaveBeenCalledWith("/favorites", { params });
    });

    it("should pass only the page param when limit is omitted", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockFavoriteListResponse);
      const params: FavoritesParams = { page: 3 };

      await favoritesService.list(params);

      expect(mockApiClient.get).toHaveBeenCalledWith("/favorites", { params });
    });

    it("should return the favorite list response with pagination on success", async () => {
      mockApiClient.get.mockResolvedValueOnce(mockFavoriteListResponse);

      const result = await favoritesService.list();

      expect(result).toEqual(mockFavoriteListResponse);
      expect(result.pagination).toEqual(mockPagination);
    });

    it("should return an empty favorites array when the user has no favorites", async () => {
      const emptyResponse: FavoriteListResponse = {
        favorites: [],
        pagination: { ...mockPagination, total: 0 },
      };
      mockApiClient.get.mockResolvedValueOnce(emptyResponse);

      const result = await favoritesService.list();

      expect(result.favorites).toHaveLength(0);
    });

    it("should return a favorite with a publication that has multiple photos", async () => {
      const favWithPhotos: Favorite = {
        ...mockFavorite,
        publication: {
          ...mockFavorite.publication,
          photos: [
            "https://cdn.example.com/photos/pan1.jpg",
            "https://cdn.example.com/photos/pan2.jpg",
          ],
        },
      };
      mockApiClient.get.mockResolvedValueOnce({
        favorites: [favWithPhotos],
        pagination: mockPagination,
      });

      const result = await favoritesService.list();

      expect(result.favorites[0].publication.photos).toHaveLength(2);
    });

    it("should return a favorite with a publication in EXPIRED status", async () => {
      const expiredFav: Favorite = {
        ...mockFavorite,
        publication: { ...mockFavorite.publication, status: "EXPIRED" },
      };
      mockApiClient.get.mockResolvedValueOnce({
        favorites: [expiredFav],
        pagination: mockPagination,
      });

      const result = await favoritesService.list();

      expect(result.favorites[0].publication.status).toBe("EXPIRED");
    });

    it("should propagate the error when GET /favorites rejects", async () => {
      const networkError = new Error("Network Error");
      mockApiClient.get.mockRejectedValueOnce(networkError);

      await expect(favoritesService.list()).rejects.toThrow("Network Error");
    });

    it("should propagate a 401 error when the user is not authenticated", async () => {
      const authError = new Error("Unauthorized");
      mockApiClient.get.mockRejectedValueOnce(authError);

      await expect(favoritesService.list()).rejects.toThrow("Unauthorized");
    });
  });

  // ── add ────────────────────────────────────────────────────────────────────

  describe("add", () => {
    it("should call POST /favorites/:publicationId with the correct publicationId", async () => {
      mockApiClient.post.mockResolvedValueOnce(undefined);

      await favoritesService.add("pub-uuid-001");

      expect(mockApiClient.post).toHaveBeenCalledWith("/favorites/pub-uuid-001");
    });

    it("should call POST /favorites/:publicationId exactly once", async () => {
      mockApiClient.post.mockResolvedValueOnce(undefined);

      await favoritesService.add("pub-uuid-001");

      expect(mockApiClient.post).toHaveBeenCalledTimes(1);
    });

    it("should not send a request body when adding a favorite", async () => {
      mockApiClient.post.mockResolvedValueOnce(undefined);

      await favoritesService.add("pub-uuid-001");

      const [, body] = mockApiClient.post.mock.calls[0];
      expect(body).toBeUndefined();
    });

    it("should use the correct dynamic publicationId in the URL", async () => {
      mockApiClient.post.mockResolvedValueOnce(undefined);

      await favoritesService.add("pub-uuid-999");

      expect(mockApiClient.post).toHaveBeenCalledWith("/favorites/pub-uuid-999");
    });

    it("should return void (undefined) on success", async () => {
      mockApiClient.post.mockResolvedValueOnce(undefined);

      const result = await favoritesService.add("pub-uuid-001");

      expect(result).toBeUndefined();
    });

    it("should propagate the error when POST /favorites/:publicationId rejects", async () => {
      const networkError = new Error("Network Error");
      mockApiClient.post.mockRejectedValueOnce(networkError);

      await expect(favoritesService.add("pub-uuid-001")).rejects.toThrow(
        "Network Error",
      );
    });

    it("should propagate a 409 error when the publication is already a favorite", async () => {
      const conflictError = new Error("Conflict");
      mockApiClient.post.mockRejectedValueOnce(conflictError);

      await expect(favoritesService.add("pub-uuid-001")).rejects.toThrow(
        "Conflict",
      );
    });

    it("should propagate a 404 error when the publication does not exist", async () => {
      const notFoundError = new Error("Not Found");
      mockApiClient.post.mockRejectedValueOnce(notFoundError);

      await expect(favoritesService.add("nonexistent-pub")).rejects.toThrow(
        "Not Found",
      );
    });
  });

  // ── remove ─────────────────────────────────────────────────────────────────

  describe("remove", () => {
    it("should call DELETE /favorites/:publicationId with the correct publicationId", async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined);

      await favoritesService.remove("pub-uuid-001");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/favorites/pub-uuid-001",
      );
    });

    it("should call DELETE /favorites/:publicationId exactly once", async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined);

      await favoritesService.remove("pub-uuid-001");

      expect(mockApiClient.delete).toHaveBeenCalledTimes(1);
    });

    it("should use the correct dynamic publicationId in the URL", async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined);

      await favoritesService.remove("pub-uuid-777");

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        "/favorites/pub-uuid-777",
      );
    });

    it("should return void (undefined) on success", async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined);

      const result = await favoritesService.remove("pub-uuid-001");

      expect(result).toBeUndefined();
    });

    it("should not call GET or POST when removing a favorite", async () => {
      mockApiClient.delete.mockResolvedValueOnce(undefined);

      await favoritesService.remove("pub-uuid-001");

      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(mockApiClient.post).not.toHaveBeenCalled();
    });

    it("should propagate the error when DELETE /favorites/:publicationId rejects", async () => {
      const networkError = new Error("Network Error");
      mockApiClient.delete.mockRejectedValueOnce(networkError);

      await expect(favoritesService.remove("pub-uuid-001")).rejects.toThrow(
        "Network Error",
      );
    });

    it("should propagate a 404 error when the publication is not in the user's favorites", async () => {
      const notFoundError = new Error("Not Found");
      mockApiClient.delete.mockRejectedValueOnce(notFoundError);

      await expect(favoritesService.remove("pub-uuid-001")).rejects.toThrow(
        "Not Found",
      );
    });

    it("should propagate a 401 error when the user is not authenticated", async () => {
      const authError = new Error("Unauthorized");
      mockApiClient.delete.mockRejectedValueOnce(authError);

      await expect(favoritesService.remove("pub-uuid-001")).rejects.toThrow(
        "Unauthorized",
      );
    });
  });
});
