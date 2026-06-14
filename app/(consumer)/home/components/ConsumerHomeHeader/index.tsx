import { Text, TouchableOpacity, View } from "react-native";
import Icon from "@/components/ui/Icon";

interface ConsumerHomeHeaderProps {
  firstName: string;
  selectedAddress: string | null;
  unreadCount: number;
  onBellPress: () => void;
}

const ConsumerHomeHeader = ({
  firstName,
  selectedAddress,
  unreadCount,
  onBellPress,
}: ConsumerHomeHeaderProps) => (
  <View>
    {selectedAddress && (
      <View className="flex-row items-center gap-1 mb-1.5">
        <Icon name="map-pin" size={11} color="primary" />
        <Text
          className="font-sans text-xs text-gray-400 flex-1"
          numberOfLines={1}
        >
          {selectedAddress}
        </Text>
      </View>
    )}
    <View className="flex-row items-center justify-between">
      <Text
        className="flex-1 mr-4 font-sans-bold text-xl text-gray-900"
        numberOfLines={1}
      >
        {firstName ? `¡Hola, ${firstName}! 👋` : "BalanZen"}
      </Text>
      <TouchableOpacity
        onPress={onBellPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        testID="btn-notifications"
      >
        <View
          className="bg-gray-100 items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: 22 }}
        >
          <Icon name="bell" size={20} color="dark" />
          {unreadCount > 0 && (
            <View
              className="absolute bg-error rounded-full border-2 border-white"
              style={{ width: 10, height: 10, top: 10, right: 10 }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

export default ConsumerHomeHeader;
