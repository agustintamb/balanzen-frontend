import { Text, View } from "react-native";
import Icon from "@/components/ui/Icon";

const NotificationsErrorState = () => (
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

export default NotificationsErrorState;
