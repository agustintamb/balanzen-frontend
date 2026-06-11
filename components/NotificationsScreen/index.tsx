import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Notification } from "@/api/notifications/notifications.types";
import Icon from "@/components/ui/Icon";
import NotificationItem from "./NotificationItem";
import NotificationsEmptyState from "./NotificationsEmptyState";
import NotificationsErrorState from "./NotificationsErrorState";
import { useNotificationsScreen } from "./useNotificationsScreen";

const ListSeparator = () => <View className="h-px bg-gray-100 mx-4" />;

const NotificationsScreen = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isRefetching,
    isMarkingAll,
    handleBack,
    handlePressNotification,
    handleMarkAllRead,
    refetch,
  } = useNotificationsScreen();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Notification>) => (
      <NotificationItem notification={item} onPress={handlePressNotification} />
    ),
    [handlePressNotification],
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#639922" />
      </View>
    );
  } else if (isError) {
    body = <NotificationsErrorState />;
  } else {
    body = (
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<NotificationsEmptyState />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#639922"
            colors={["#639922"]}
          />
        }
      />
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pt-6 pb-2">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <Icon name="chevron-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark">
            Notificaciones
          </Text>
          <View className="w-10" />
        </View>

        <View className="flex-row items-center justify-between px-4 pb-4">
          <Text className="font-sans text-sm text-gray-400">
            {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día ✓"}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              disabled={isMarkingAll}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="btn-mark-all-read"
            >
              <Text className="font-sans-semibold text-sm text-primary">
                Marcar como leídas
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-white">{body}</View>
    </>
  );
};

export default NotificationsScreen;
