import { Text, View } from "react-native";
import Icon from "@/components/ui/Icon";

const NotificationsEmptyState = () => (
  <View className="items-center gap-4 pt-20 px-10">
    <Icon
      name="bell"
      size={36}
      variant="soft"
      color="muted"
      containerSize={76}
    />
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

export default NotificationsEmptyState;
