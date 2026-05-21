import "@/global.css";
import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import SplashOverlay from "@/components/SplashOverlay";
import QueryProvider from "@/providers/QueryProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    // Acá va la lógica de carga: auth check, etc.
    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  return (
    <QueryProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <SplashOverlay />
    </QueryProvider>
  );
}
