import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Favorite } from "@/api/favorites/favorites.types";
import ActionSheet from "@/components/ui/ActionSheet";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
import Icon from "@/components/ui/Icon";
import FavoriteCard from "./FavoriteCard";
import FavoritesEmptyState from "./FavoritesEmptyState";
import { useFavoritesScreen } from "./useFavoritesScreen";

const FavoritesScreen = () => {
  const {
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
  } = useFavoritesScreen();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Favorite>) => (
      <FavoriteCard item={item} onRemove={handleRemove} />
    ),
    [handleRemove],
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#639922" />
      </View>
    );
  } else if (favorites.length === 0) {
    body = <FavoritesEmptyState />;
  } else {
    body = (
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <AppRefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pt-6 pb-4">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <Icon name="chevron-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark">
            Mis favoritos
          </Text>
          {total > 0 ? (
            <View className="w-10 items-end pr-1">
              <View
                className="bg-primary rounded-full items-center justify-center"
                style={{ minWidth: 22, height: 22, paddingHorizontal: 5 }}
              >
                <Text
                  className="text-white font-sans-semibold"
                  style={{ fontSize: 11 }}
                >
                  {total}
                </Text>
              </View>
            </View>
          ) : (
            <View className="w-10" />
          )}
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-surface">{body}</View>

      <ActionSheet
        visible={!!pendingRemoveId}
        iconName="heart"
        iconColor="error"
        title="¿Quitar de favoritos?"
        message="Esta publicación será eliminada de tu lista de favoritos."
        confirmLabel="Sí, quitar"
        confirmVariant="danger"
        onConfirm={handleRemoveConfirm}
        loading={isRemoving}
        cancelLabel="Cancelar"
        onCancel={handleRemoveCancel}
      />
    </View>
  );
};

export default FavoritesScreen;
