import "@/global.css";
import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import SplashOverlay from "@/components/SplashOverlay";
import Toast from "@/components/ui/Toast";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    TanMeringue: require("@/assets/fonts/TAN-Meringue-Font/TAN MERINGUE.ttf"),
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    // Acá va la lógica de carga: auth check, etc.
    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <QueryProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <SplashOverlay />
        <Toast />
      </AuthProvider>
    </QueryProvider>
  );
}
