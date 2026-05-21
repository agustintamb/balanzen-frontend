import apiClient from "@/api/client";
import {
  FavoriteListResponse,
  FavoritesParams,
} from "@/api/favorites/favorites.types";

export const favoritesService = {
  list: (params?: FavoritesParams): Promise<FavoriteListResponse> =>
    apiClient.get("/favorites", { params }),

  add: (publicationId: string): Promise<void> =>
    apiClient.post(`/favorites/${publicationId}`),

  remove: (publicationId: string): Promise<void> =>
    apiClient.delete(`/favorites/${publicationId}`),
};
