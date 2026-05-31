import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const ConsumerOrders = () => (
  <>
    <StatusBar style="dark" />
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-surface items-center justify-center px-6"
    >
      <Text className="font-sans-bold text-xl text-primary-dark">
        Mis pedidos
      </Text>
      <Text className="font-sans text-base text-gray-500 mt-2 text-center">
        En construcción
      </Text>
    </SafeAreaView>
  </>
);

export default ConsumerOrders;
