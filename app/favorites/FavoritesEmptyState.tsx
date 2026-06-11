import { Text, View } from "react-native";
import Icon from "@/components/ui/Icon";

const FavoritesEmptyState = () => (
  <View className="flex-1 items-center justify-center px-8" style={{ gap: 12 }}>
    <Icon name="heart" size={40} color="muted" />
    <Text className="font-sans-semibold text-base text-primary-dark text-center">
      Todavía no tenés favoritos
    </Text>
    <Text className="font-sans text-sm text-gray-400 text-center">
      Guardá publicaciones que te interesen para encontrarlas fácilmente.
    </Text>
  </View>
);

export default FavoritesEmptyState;
