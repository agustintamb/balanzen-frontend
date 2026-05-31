import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

export interface MenuItemProps {
  children: ReactNode;
  onPress: () => void;
  badgeCount?: number;
  position?: "single" | "first" | "middle" | "last";
  variant?: "default" | "danger";
  leftIcon?: IconName;
  testID?: string;
  className?: string;
}

// Only border-side (width) classes — no color here so the variant color wins.
const positionBorderClass = (position: MenuItemProps["position"]): string => {
  if (position === "first") return "rounded-t-xl border-t border-l border-r";
  if (position === "middle") return "border-t border-l border-r";
  if (position === "last") return "rounded-b-xl border";
  return "rounded-xl border mb-3";
};

const MenuItem = ({
  children,
  onPress,
  badgeCount,
  position,
  variant = "default",
  leftIcon,
  testID,
  className,
}: MenuItemProps) => {
  const isDanger = variant === "danger";

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      className={cn(
        "flex-row items-center justify-between px-4 h-[72px]",
        isDanger
          ? "bg-error-light border-error"
          : "bg-white border-surface-dark",
        positionBorderClass(position),
        className,
      )}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {leftIcon !== undefined && (
          <Icon
            name={leftIcon}
            size={18}
            color={isDanger ? "error" : "neutral"}
          />
        )}
        <Text
          className={cn(
            "font-sans-medium text-base",
            isDanger ? "text-error" : "text-primary-dark",
          )}
        >
          {children}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {badgeCount !== undefined && badgeCount > 0 && (
          <View className="bg-error rounded-full min-w-6 h-6 items-center justify-center px-1.5">
            <Text className="font-sans-bold text-sm text-white">
              {badgeCount > 99 ? "99+" : String(badgeCount)}
            </Text>
          </View>
        )}
        {!isDanger && <Icon name="chevron-right" size={18} color="muted" />}
      </View>
    </Pressable>
  );
};

export default MenuItem;
