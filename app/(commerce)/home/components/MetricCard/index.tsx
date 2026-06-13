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
        "flex-1 rounded-2xl p-4 gap-1 items-center",
        isGreen ? "bg-primary-light" : "bg-warning-light",
      )}
    >
      <Icon
        name={icon}
        size={18}
        variant="soft"
        color={isGreen ? "primary" : "warning"}
      />
      <Text
        className={cn(
          "font-sans-bold text-lg",
          isGreen ? "text-primary-dark" : "text-warning",
        )}
      >
        {value}
      </Text>
      <Text className="font-sans text-xs text-gray-500">{label}</Text>
    </View>
  );
};

export default MetricCard;
