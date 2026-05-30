import { Text, TouchableOpacity, View } from "react-native";
import type { UserRole } from "@/api/users/users.types";
import Chip from "@/components/ui/Chip";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

export interface RoleOption {
  id: UserRole;
  iconName: IconName;
  title: string;
  description: string;
  benefits: string[];
}

interface RoleCardProps {
  role: RoleOption;
  selected: boolean;
  onPress: () => void;
}

const RoleCard = ({ role, selected, onPress }: RoleCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className={cn(
      "rounded-2xl p-5 border-2",
      selected ? "border-primary bg-primary-light" : "border-gray-200 bg-white",
    )}
  >
    <View className="flex-row items-start">
      <View
        className={cn(
          "w-12 h-12 rounded-full items-center justify-center mr-4",
          selected ? "bg-white" : "bg-primary-light",
        )}
      >
        <Icon name={role.iconName} size={24} />
      </View>

      <View className="flex-1 justify-center">
        <Text className="font-sans-bold text-lg text-primary-dark">
          {role.title}
        </Text>
        <Text className="font-sans text-base text-gray-500 mt-1 leading-6">
          {role.description}
        </Text>
      </View>

      <View style={{ opacity: selected ? 1 : 0 }} className="ml-2">
        <Icon name="checkmark-circle" size={26} />
      </View>
    </View>

    <View className="flex-row gap-2 mt-4">
      {role.benefits.map((benefit) => (
        <Chip
          key={benefit}
          label={benefit}
          className={cn("flex-1", selected ? "bg-white" : "")}
          size="md"
        />
      ))}
    </View>
  </TouchableOpacity>
);

export default RoleCard;
