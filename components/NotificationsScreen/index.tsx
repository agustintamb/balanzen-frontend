import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Notification } from "@/api/notifications/notifications.types";
import Icon from "@/components/ui/Icon";
import NotificationItem from "./NotificationItem";
import { useNotificationsScreen } from "./useNotificationsScreen";


const EmptyState = () => (
  <View className="items-center gap-4 pt-20 px-10">
    <Icon name="bell" size={36} variant="soft" color="muted" containerSize={76} />
    <View className="items-center gap-1">
      <Text className="font-sans-semibold text-base text-primary-dark">
        Sin notificaciones
      </Text>
      <Text className="font-sans text-sm text-gray-400 text-center leading-5">
        Cuando tengas novedades aparecerán aquí.
      </Text>
    </View>
  </View>
);

const ErrorState = () => (
  <View className="items-center gap-4 pt-20 px-10">
    <Icon
      name="alert-circle"
      size={36}
      variant="soft"
      color="error"
      containerSize={76}
    />
    <View className="items-center gap-1">
      <Text className="font-sans-semibold text-base text-primary-dark">
        Error al cargar
      </Text>
      <Text className="font-sans text-sm text-gray-400 text-center leading-5">
        No se pudieron obtener las notificaciones.
      </Text>
    </View>
  </View>
);

const NotificationsScreen = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isMarkingAll,
    handleBack,
    handlePressNotification,
    handleMarkAllRead,
  } = useNotificationsScreen();

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem notification={item} onPress={handlePressNotification} />
  );

  return (
    <>
      <StatusBar style="dark" />

      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="px-4 pt-3 pb-5">
          {/* Fila: back + título */}
          <View className="flex-row items-center gap-1 mb-2">
            <TouchableOpacity
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="mr-2"
              testID="btn-back"
            >
              <View className="w-9 h-9 rounded-full border border-gray-200 bg-white items-center justify-center">
                <Icon name="chevron-left" size={20} color="primary-dark" />
              </View>
            </TouchableOpacity>
            <Text className="font-sans-bold text-2xl text-primary-dark flex-1">
              Notificaciones
            </Text>
          </View>

          {/* Sub-fila: conteo + acción */}
          <View className="flex-row items-center justify-between pl-9">
            <Text className="font-sans text-sm text-gray-400">
              {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día"}
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
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-surface">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#639922" />
          </View>
        ) : isError ? (
          <ErrorState />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 40,
              gap: 10,
            }}
          />
        )}
      </View>
    </>
  );
};

export default NotificationsScreen;
