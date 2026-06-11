import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const CommercePublications = () => (
  <>
    <StatusBar style="dark" />
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-surface items-center justify-center px-6"
    >
      <Text className="font-sans-bold text-xl text-primary-dark">Publicar</Text>
      <Text className="font-sans text-base text-gray-500 mt-2 text-center">
        En construcción
      </Text>
    </SafeAreaView>
  </>
);

export default CommercePublications;
