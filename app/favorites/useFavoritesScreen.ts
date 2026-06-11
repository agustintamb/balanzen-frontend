import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites, useRemoveFavorite } from "@/hooks/useFavorites";

export const useFavoritesScreen = () => {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useFavorites();
  const { mutate: removeFavorite } = useRemoveFavorite();

  const favorites = data?.favorites ?? [];
  const total = data?.pagination.total ?? 0;

  const handleBack = () => router.back();

  const handleRemove = (publicationId: string) => {
    Alert.alert(
      "Quitar de favoritos",
      "¿Querés quitar esta publicación de tus favoritos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: () => removeFavorite(publicationId),
        },
      ],
    );
  };

  return {
    favorites,
    total,
    isLoading,
    isRefetching,
    refetch,
    handleBack,
    handleRemove,
  };
};

// Expo Router requires a default export in app/ — this is a hook, not a screen
export default function _() {
  return null;
}