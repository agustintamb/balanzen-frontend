import { Text, TouchableOpacity, View } from "react-native";

interface NotificationsListHeaderProps {
  unreadCount: number;
  isMarkingAll: boolean;
  onMarkAllRead: () => void;
}

const NotificationsListHeader = ({
  unreadCount,
  isMarkingAll,
  onMarkAllRead,
}: NotificationsListHeaderProps) => (
  <View className="flex-row items-center justify-between mb-2">
    <Text className="font-sans text-sm text-gray-400">
      {unreadCount > 0 ? `${unreadCount} sin leer` : "Todo al día ✓"}
    </Text>
    {unreadCount > 0 && (
      <TouchableOpacity
        onPress={onMarkAllRead}
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
);

export default NotificationsListHeader;
