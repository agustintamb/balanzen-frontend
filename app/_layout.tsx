import "@/global.css";
import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SystemUI from "expo-system-ui";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { colorScheme } from "nativewind";
import SplashOverlay from "@/components/SplashOverlay";
import Toast from "@/components/ui/Toast";
import AuthProvider from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProvider";

colorScheme.set("light");
SystemUI.setBackgroundColorAsync("#F1EFE8");
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
    <ThemeProvider value={DefaultTheme}>
      <QueryProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#F1EFE8" },
            }}
          />
          <SplashOverlay />
          <Toast />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
