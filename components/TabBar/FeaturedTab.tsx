import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import {
  type TabItemProps,
  CIRCLE_SHADOW,
  GRADIENT_COLORS,
  GRADIENT_END,
  GRADIENT_START,
  GRADIENT_STYLE,
  labelClass,
} from "./tabBar.utils";

// Tab con botón FAB circular flotante para la acción principal del rol
const FeaturedTab = ({ config, isFocused, onPress, testID }: TabItemProps) => (
  <Pressable
    onPress={onPress}
    testID={testID}
    hitSlop={{ top: 40 }}
    className="flex-1 items-center pt-3 pb-2"
  >
    {/* Espaciadores que replican el layout del dot + ícono → labels alineados */}
    <View className="h-1.5 mb-1" />
    <View className="h-[22px]" />
    <View style={CIRCLE_SHADOW}>
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={GRADIENT_STYLE}
      >
        {/* Feather directo: Icon no expone color blanco (inverso) */}
        <Feather name={config.icon} size={30} color="#FFFFFF" />
      </LinearGradient>
    </View>
    <Text className={labelClass(isFocused)}>{config.label}</Text>
  </Pressable>
);

export default FeaturedTab;
