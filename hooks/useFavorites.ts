import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { favoritesService } from "@/api/favorites/favorites.service";
import { FavoriteListResponse, FavoritesParams } from "@/api/favorites/favorites.types";

export const useFavorites = (params?: FavoritesParams) =>
  useQuery<FavoriteListResponse, Error>({
    queryKey: ["favorites", params],
    queryFn: () => favoritesService.list(params),
    staleTime: 1000 * 60 * 2,
  });

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: favoritesService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: favoritesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
};
