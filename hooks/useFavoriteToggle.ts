import { useEffect, useState } from "react";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/useFavorites";

export const useFavoriteToggle = (publicationId?: string) => {
  const { data } = useFavorites();
  const { mutate: addFavorite } = useAddFavorite();
  const { mutate: removeFavorite } = useRemoveFavorite();

  const serverIsFavorite =
    data?.favorites.some((fav) => fav.publication.id === publicationId) ??
    false;

  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  useEffect(() => {
    setOptimistic(null);
  }, [serverIsFavorite]);

  const isFavorite = optimistic ?? serverIsFavorite;

  const toggleFavorite = () => {
    if (!publicationId) return;
    const next = !isFavorite;
    setOptimistic(next);
    if (next) addFavorite(publicationId);
    else removeFavorite(publicationId);
  };

  return { isFavorite, toggleFavorite };
};
