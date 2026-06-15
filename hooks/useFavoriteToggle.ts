import { useEffect, useState } from "react";
import {
  useAddFavorite,
  useFavorites,
  useRemoveFavorite,
} from "@/hooks/useFavorites";

/**
 * Estado + toggle de favorito para una publicación. Mantiene un override
 * optimista para que el corazón responda al instante y la próxima pulsación
 * dispare la mutación contraria correcta (evita re-agregar duplicado). El
 * override se suelta cuando el servidor confirma el cambio (refetch tras
 * invalidar la query de favoritos).
 */
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
