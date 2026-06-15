import "@/global.css";
import { useEffect } from "react";
import { Platform } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
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
import SocketProvider from "@/providers/SocketProvider";

colorScheme.set("light");
SystemUI.setBackgroundColorAsync("#F1EFE8");
SplashScreen.preventAutoHideAsync();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F1EFE8",
  },
};

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
    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  return (
    <ThemeProvider value={AppTheme}>
      <KeyboardProvider>
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <StatusBar style="dark" backgroundColor="transparent" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#F1EFE8" },
                }}
              />
              <SplashOverlay />
              <Toast />
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
