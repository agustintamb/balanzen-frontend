import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tv } from "tailwind-variants";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "neutral" | "textLink" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  leftIconName?: IoniconName;
  rightIconName?: IoniconName;
  className?: string;
  testID?: string;
}

const button = tv({
  slots: {
    container: "flex-row items-center justify-center",
    label: "font-sans-semibold",
  },
  variants: {
    variant: {
      primary: {
        container: "bg-primary rounded-2xl",
        label: "text-white",
      },
      secondary: {
        container: "bg-primary-light border border-primary rounded-2xl",
        label: "text-primary",
      },
      tertiary: {
        container: "bg-transparent border border-primary rounded-2xl",
        label: "text-primary",
      },
      neutral: {
        container: "bg-transparent border border-gray-200 rounded-2xl",
        label: "text-gray-700",
      },
      textLink: {
        container: "bg-transparent",
        label: "text-primary",
      },
      danger: {
        container: "bg-error rounded-2xl",
        label: "text-white",
      },
    },
    size: {
      sm: {
        container: "px-3 py-2 gap-1.5",
        label: "text-sm",
      },
      md: {
        container: "px-5 py-4 gap-2",
        label: "text-base",
      },
      lg: {
        container: "px-6 py-[18px] gap-2.5",
        label: "text-lg",
      },
    },
    disabled: {
      true: {
        container: "",
      },
    },
  },
  compoundVariants: [
    // textLink: remove size padding
    { variant: "textLink", class: { container: "px-0 py-0 gap-1" } },
    // Disabled: tono cálido beige/marrón acorde al fondo de la app
    {
      variant: "primary",
      disabled: true,
      class: { container: "bg-surface-dark", label: "text-gray-400" },
    },
    {
      variant: "danger",
      disabled: true,
      class: { container: "bg-surface-dark", label: "text-gray-400" },
    },
    {
      variant: "secondary",
      disabled: true,
      class: {
        container: "bg-surface border-surface-dark",
        label: "text-gray-400",
      },
    },
    {
      variant: "tertiary",
      disabled: true,
      class: { container: "border-surface-dark", label: "text-gray-400" },
    },
    {
      variant: "textLink",
      disabled: true,
      class: { label: "text-gray-400" },
    },
    {
      variant: "neutral",
      disabled: true,
      class: { container: "border-gray-100", label: "text-gray-300" },
    },
  ],
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// Icon color by variant — white on solid bg, primary on transparent bg
const ICON_COLORS: Record<
  NonNullable<ButtonProps["variant"]>,
  { normal: string; disabled: string }
> = {
  primary: { normal: "#FFFFFF", disabled: "#9CA3AF" },
  secondary: { normal: "#639922", disabled: "#9CA3AF" },
  tertiary: { normal: "#639922", disabled: "#9CA3AF" },
  neutral: { normal: "#374151", disabled: "#D1D5DB" },
  textLink: { normal: "#639922", disabled: "#9CA3AF" },
  danger: { normal: "#FFFFFF", disabled: "#9CA3AF" },
};

const ICON_SIZE: Record<NonNullable<ButtonProps["size"]>, number> = {
  sm: 16,
  md: 18,
  lg: 22,
};

const Button = ({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  leftIconName,
  rightIconName,
  className,
  testID,
}: ButtonProps) => {
  // loading mantiene los colores normales del botón (spinner en lugar de texto)
  // disabled aplica los estilos griseados solo cuando no hay carga en curso
  const { container, label: labelStyle } = button({
    variant,
    size,
    disabled: disabled && !loading,
  });
  const iconColor =
    ICON_COLORS[variant][disabled && !loading ? "disabled" : "normal"];
  const iconSize = ICON_SIZE[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={container({ class: className })}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {leftIconName && (
            <Ionicons name={leftIconName} size={iconSize} color={iconColor} />
          )}
          <Text className={labelStyle()}>{children}</Text>
          {rightIconName && (
            <Ionicons name={rightIconName} size={iconSize} color={iconColor} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
