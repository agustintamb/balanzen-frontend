import { Text, View } from "react-native";
import Icon, { IconColor, IconName } from "@/components/ui/Icon";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  color: IconColor;
}

const MetricCard = ({ label, value, icon, color }: MetricCardProps) => (
  <View
    className="flex-row items-center bg-white rounded-[24px] p-4 mb-4"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    }}
  >
    <View className="mr-4">
      <Icon
        name={icon}
        size={20}
        variant="soft"
        color={color}
        containerSize={48}
      />
    </View>
    <Text className="flex-1 font-sans text-gray-400 text-base">{label}</Text>
    <Text className="font-sans-bold text-2xl text-primary-dark">{value}</Text>
  </View>
);

export default MetricCard;
