import { Text, View } from "react-native";
import Icon from "@/components/ui/Icon";

interface HomeListEmptyProps {
  isLoading: boolean;
}

const HomeListEmpty = ({ isLoading }: HomeListEmptyProps) => {
  if (isLoading) return null;

  return (
    <View className="items-center justify-center pt-20 px-6">
      <Icon name="package" size={40} color="muted" />
      <Text className="font-sans-medium text-base text-gray-500 mt-3 text-center">
        No hay publicaciones disponibles.
      </Text>
    </View>
  );
};

export default HomeListEmpty;
