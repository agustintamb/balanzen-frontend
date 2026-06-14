import type { IconName } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

export interface TabConfig {
  label: string;
  icon: IconName;
}

export interface TabItemProps {
  config: TabConfig;
  isFocused: boolean;
  onPress: () => void;
  testID: string;
}

export const ROUTE_CONFIG: Record<string, TabConfig> = {
  home: { label: "Inicio", icon: "home" },
  orders: { label: "Mis pedidos", icon: "package" },
  publish: { label: "Publicar", icon: "plus" },
  profile: { label: "Perfil", icon: "user" },
};

export const FEATURED_ROUTES = new Set(["orders", "publish"]);

// Rutas que ocupan la pantalla completa: el tab bar se oculta mientras están
// activas (ej. el flujo de crear publicación).
export const HIDDEN_TAB_BAR_ROUTES = new Set(["publish"]);

export const GRADIENT_COLORS: [string, string] = ["#78B82B", "#4A8314"];
export const GRADIENT_START = { x: 0.2, y: 0 };
export const GRADIENT_END = { x: 0.8, y: 1 };

// Estilo inline necesario: LinearGradient no es parchado por NativeWind
export const CIRCLE_SHADOW = {
  position: "absolute" as const,
  top: -20,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "#639922",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 6,
};

export const GRADIENT_STYLE = {
  width: 56,
  height: 56,
  borderRadius: 28,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  overflow: "hidden" as const,
};

export const labelClass = (isFocused: boolean) =>
  cn(
    "text-xs font-sans-medium mt-1",
    isFocused ? "text-primary" : "text-gray-400",
  );
