import { Text, View } from "react-native";
import { tv } from "tailwind-variants";

export interface ChipProps {
  label: string;
  variant?: "primary" | "warning" | "error" | "neutral";
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  className?: string;
  testID?: string;
}

const chip = tv({
  slots: {
    container: "flex-row rounded-full items-center justify-center",
    dot: "rounded-full",
    label: "font-sans-medium",
  },
  variants: {
    variant: {
      primary: {
        container: "bg-primary-light",
        dot: "bg-primary",
        label: "text-primary-dark",
      },
      warning: {
        container: "bg-warning-light",
        dot: "bg-warning",
        label: "text-warning",
      },
      error: {
        container: "bg-error-light",
        dot: "bg-error",
        label: "text-error",
      },
      neutral: {
        container: "bg-gray-100",
        dot: "bg-gray-400",
        label: "text-gray-600",
      },
    },
    size: {
      sm: {
        container: "px-2 py-[3px] gap-1",
        dot: "w-1.5 h-1.5",
        label: "text-xs",
      },
      md: {
        container: "px-3 py-[6px] gap-1.5",
        dot: "w-2 h-2",
        label: "text-sm",
      },
      lg: {
        container: "px-4 py-2.5 gap-2",
        dot: "w-2.5 h-2.5",
        label: "text-base",
      },
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const Chip = ({
  label,
  variant = "primary",
  size = "md",
  showDot = false,
  className,
  testID,
}: ChipProps) => {
  const { container, dot, label: labelStyle } = chip({ variant, size });

  return (
    <View className={container({ class: className })} testID={testID}>
      {showDot && <View className={dot()} />}
      <Text
        className={labelStyle()}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {label}
      </Text>
    </View>
  );
};

export default Chip;
