import { Text, TouchableOpacity, View } from "react-native";
import Icon from "@/components/ui/Icon";

interface HomeHeaderProps {
  businessName: string;
  unreadCount: number;
  onBellPress: () => void;
}

const HomeHeader = ({
  businessName,
  unreadCount,
  onBellPress,
}: HomeHeaderProps) => (
  <View className="flex-row items-center justify-between">
    <Text
      className="flex-1 mr-4 font-sans-bold text-xl text-gray-900"
      numberOfLines={1}
    >
      {businessName}
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
);

export default HomeHeader;
