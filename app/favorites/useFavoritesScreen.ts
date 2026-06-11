import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useFavorites, useRemoveFavorite } from "@/hooks/useFavorites";

export const useFavoritesScreen = () => {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useFavorites();
  const { mutate: removeFavorite, isPending: isRemoving } = useRemoveFavorite();

  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const favorites = data?.favorites ?? [];
  const total = data?.pagination.total ?? 0;

  const handleBack = useCallback(() => router.back(), [router]);

  const handleRemove = useCallback((publicationId: string) => {
    setPendingRemoveId(publicationId);
  }, []);

  const handleRemoveConfirm = useCallback(() => {
    if (!pendingRemoveId) return;
    removeFavorite(pendingRemoveId, {
      onSuccess: () => setPendingRemoveId(null),
    });
  }, [pendingRemoveId, removeFavorite]);

  const handleRemoveCancel = useCallback(() => {
    setPendingRemoveId(null);
  }, []);

  return {
    favorites,
    total,
    isLoading,
    isRefetching,
    isRemoving,
    pendingRemoveId,
    refetch,
    handleBack,
    handleRemove,
    handleRemoveConfirm,
    handleRemoveCancel,
  };
};

// Expo Router requires a default export in app/ — this is a hook, not a screen
export default function _() {
  return null;
}
