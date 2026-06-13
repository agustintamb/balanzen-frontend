import { Text, View } from "react-native";
import Icon from "@/components/ui/Icon";
import type { FilterKey } from "../../useCommerceHomeScreen";

const EMPTY_LABEL: Record<FilterKey, string> = {
  ALL: "Todavía no tenés publicaciones.",
  ACTIVE: "No tenés publicaciones activas.",
  RESERVED: "No tenés publicaciones reservadas.",
  DELIVERED: "No tenés publicaciones entregadas.",
  CANCELLED: "No tenés publicaciones canceladas ni vencidas.",
  EXPIRED: "No tenés publicaciones vencidas.",
};

interface HomeListEmptyProps {
  filter: FilterKey;
}

const HomeListEmpty = ({ filter }: HomeListEmptyProps) => (
  <View className="items-center justify-center pt-12 px-8">
    <Icon name="package" size={40} color="muted" />
    <Text className="font-sans-medium text-base text-gray-500 mt-3 text-center">
      {EMPTY_LABEL[filter]}
    </Text>
  </View>
);

export default HomeListEmpty;
