import { TouchableOpacity, View } from "react-native";
import Icon, { type IconName } from "@/components/ui/Icon";

interface IconButtonProps {
  iconName: IconName;
  onPress: () => void;
  active?: boolean;
  rotate?: string;
  size?: number;
  iconSize?: number;
  testID?: string;
}

const IconButton = ({
  iconName,
  onPress,
  active = false,
  rotate,
  size = 42,
  iconSize = 20,
  testID,
}: IconButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    testID={testID}
  >
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size / 3.5),
        backgroundColor: active ? "#639922" : "#FFFFFF",
        borderWidth: 1.5,
        borderColor: active ? "#639922" : "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={rotate ? { transform: [{ rotate }] } : undefined}>
        <Icon
          name={iconName}
          size={iconSize}
          color={active ? "white" : "neutral"}
        />
      </View>
    </View>
  </TouchableOpacity>
);

export default IconButton;
