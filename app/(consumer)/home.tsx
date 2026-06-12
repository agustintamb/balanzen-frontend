import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthToken } from "@/api/client";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth.store";

const ConsumerHome = () => {
  const { user, clear } = useAuthStore();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    setAuthToken(null);
    clear();
    queryClient.clear();
    router.replace("/(auth)");
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F1EFE8",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          paddingHorizontal: 24,
        }}
      >
        <Text
          style={{ fontFamily: "TanMeringue", fontSize: 40, color: "#27500A" }}
        >
          BalanZen
        </Text>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 20,
            color: "#27500A",
            textAlign: "center",
          }}
        >
          ¡Hola, {user?.first_name}!
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          Home del consumidor — en construcción
        </Text>
        <Button variant="secondary" onPress={handleLogout}>
          Cerrar sesión
        </Button>
      </SafeAreaView>
    </>
  );
};

export default ConsumerHome;
