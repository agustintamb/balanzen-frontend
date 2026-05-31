import { Pressable, Text, View } from "react-native";
import Icon, { type IconColor } from "@/components/ui/Icon";
import { type TabItemProps, labelClass } from "./tabBar.utils";

// Tab estándar con indicador de punto activo
const RegularTab = ({ config, isFocused, onPress, testID }: TabItemProps) => {
  const iconColor: IconColor = isFocused ? "primary" : "muted";
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      className="flex-1 items-center pt-3 pb-2"
    >
      <View className="h-1.5 w-1.5 rounded-full mb-1">
        {isFocused && <View className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </View>
      <Icon name={config.icon} variant="plain" color={iconColor} size={22} />
      <Text className={labelClass(isFocused)}>{config.label}</Text>
    </Pressable>
  );
};

export default RegularTab;
