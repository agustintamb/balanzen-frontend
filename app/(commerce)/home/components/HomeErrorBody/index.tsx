import { Text, TouchableOpacity, View } from "react-native";
import Icon from "@/components/ui/Icon";

interface HomeErrorBodyProps {
  onRetry: () => void;
}

const HomeErrorBody = ({ onRetry }: HomeErrorBodyProps) => (
  <View className="flex-1 bg-surface items-center justify-center px-8">
    <Icon name="wifi-off" size={40} color="muted" />
    <Text className="font-sans-medium text-base text-gray-500 mt-3 text-center">
      No pudimos cargar los datos. Revisá tu conexión.
    </Text>
    <TouchableOpacity
      onPress={onRetry}
      className="mt-4 px-5 py-2"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text className="font-sans-semibold text-sm text-primary">
        Reintentar
      </Text>
    </TouchableOpacity>
  </View>
);

export default HomeErrorBody;
