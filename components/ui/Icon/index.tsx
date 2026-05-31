import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { cn } from "@/utils/cn";

// Exportado para que otros archivos no necesiten importar Feather solo por el tipo
export type IconName = React.ComponentProps<typeof Feather>["name"];

export type IconVariant = "plain" | "soft" | "filled" | "outline";
export type IconColor =
  | "primary"
  | "primary-dark"
  | "error"
  | "warning"
  | "neutral"
  | "muted";

export interface IconProps {
  name: IconName;
  size?: number;
  variant?: IconVariant;
  color?: IconColor;
  containerSize?: number;
  className?: string;
  testID?: string;
}

// Background / border classes para cada variante × color (solo variantes con fondo)
const BG_CLASSES: Record<
  Exclude<IconVariant, "plain">,
  Record<IconColor, string>
> = {
  soft: {
    primary: "bg-primary-light",
    "primary-dark": "bg-primary-light",
    error: "bg-error-light",
    warning: "bg-warning-light",
    neutral: "bg-gray-100",
    muted: "bg-gray-100",
  },
  filled: {
    primary: "bg-primary",
    "primary-dark": "bg-primary-dark",
    error: "bg-error",
    warning: "bg-warning",
    neutral: "bg-gray-500",
    muted: "bg-gray-300",
  },
  outline: {
    primary: "border border-primary bg-transparent",
    "primary-dark": "border border-primary-dark bg-transparent",
    error: "border border-error bg-transparent",
    warning: "border border-warning bg-transparent",
    neutral: "border border-gray-300 bg-transparent",
    muted: "border border-gray-200 bg-transparent",
  },
};

// Color del ícono Feather para cada variante × color
const ICON_COLORS: Record<IconVariant, Record<IconColor, string>> = {
  plain: {
    primary: "#639922",
    "primary-dark": "#27500A",
    error: "#E84234",
    warning: "#BA7517",
    neutral: "#6B7280",
    muted: "#9CA3AF",
  },
  soft: {
    primary: "#639922",
    "primary-dark": "#27500A",
    error: "#E84234",
    warning: "#BA7517",
    neutral: "#6B7280",
    muted: "#9CA3AF",
  },
  filled: {
    primary: "#FFFFFF",
    "primary-dark": "#FFFFFF",
    error: "#FFFFFF",
    warning: "#FFFFFF",
    neutral: "#FFFFFF",
    muted: "#FFFFFF",
  },
  outline: {
    primary: "#639922",
    "primary-dark": "#27500A",
    error: "#E84234",
    warning: "#BA7517",
    neutral: "#6B7280",
    muted: "#9CA3AF",
  },
};

const Icon = ({
  name,
  size = 20,
  variant = "plain",
  color = "primary",
  containerSize,
  className,
  testID,
}: IconProps) => {
  const iconColor = ICON_COLORS[variant][color];

  if (variant === "plain") {
    return <Feather name={name} size={size} color={iconColor} />;
  }

  const resolvedSize = containerSize ?? size * 2;

  return (
    <View
      className={cn(
        "items-center justify-center rounded-full",
        BG_CLASSES[variant][color],
        className,
      )}
      style={{ width: resolvedSize, height: resolvedSize }}
      testID={testID}
    >
      <Feather name={name} size={size} color={iconColor} />
    </View>
  );
};

export default Icon;
