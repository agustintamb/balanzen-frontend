import { Text, View } from "react-native";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface MetricCardProps {
  icon: IconName;
  value: number;
  label: string;
  variant: "green" | "orange";
}

const MetricCard = ({ icon, value, label, variant }: MetricCardProps) => {
  const isGreen = variant === "green";

  return (
    <View
      className={cn(
        "flex-1 rounded-2xl p-4 gap-1",
        isGreen ? "bg-primary-light" : "bg-warning-light",
      )}
    >
      <Icon
        name={icon}
        size={18}
        variant="soft"
        color={isGreen ? "primary" : "warning"}
        containerSize={36}
      />
      <Text
        className={cn(
          "font-sans-bold text-4xl mt-1",
          isGreen ? "text-primary-dark" : "text-warning",
        )}
      >
        {value}
      </Text>
      <Text
        className={cn(
          "font-sans text-xs",
          isGreen ? "text-primary-medium" : "text-warning",
        )}
      >
        {label}
      </Text>
    </View>
  );
};

export default MetricCard;
