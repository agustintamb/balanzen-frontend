import { Switch, Text, View } from "react-native";
import { cn } from "@/utils/cn";

interface DonationCardProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const DonationCard = ({ value, onChange }: DonationCardProps) => (
  <View
    className={cn(
      "flex-row items-center rounded-2xl border p-4",
      value ? "border-primary bg-primary-light" : "border-gray-200 bg-white",
    )}
  >
    <View
      className={cn(
        "h-12 w-12 items-center justify-center rounded-xl",
        value ? "bg-primary/30" : "bg-surface-dark",
      )}
    >
      <Text className="text-xl">{value ? "💚" : "🖤"}</Text>
    </View>

    <View className="ml-3 flex-1">
      <Text className="font-sans-bold text-base text-primary-dark">
        Publicar como donación
      </Text>
      <Text className="font-sans text-sm text-gray-500">
        El producto será gratuito
      </Text>
    </View>

    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: "#E3E0D8", true: "#639922" }}
      thumbColor="#FFFFFF"
      testID="donation-switch"
    />
  </View>
);

export default DonationCard;
