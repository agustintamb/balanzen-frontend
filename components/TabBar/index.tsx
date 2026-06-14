import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import FeaturedTab from "./FeaturedTab";
import RegularTab from "./RegularTab";
import {
  FEATURED_ROUTES,
  HIDDEN_TAB_BAR_ROUTES,
  ROUTE_CONFIG,
} from "./tabBar.utils";

const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const { bottom } = useSafeAreaInsets();

  const focusedRouteName = state.routes[state.index]?.name;
  if (focusedRouteName && HIDDEN_TAB_BAR_ROUTES.has(focusedRouteName)) {
    return null;
  }

  return (
    <View
      className="flex-row bg-white border-t border-surface-dark"
      style={{ paddingBottom: Math.max(bottom, 8) }}
    >
      {state.routes.map((route, index) => {
        const config = ROUTE_CONFIG[route.name];
        if (!config) return null;

        const isFocused = state.index === index;

        const handlePress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const tabProps = {
          config,
          isFocused,
          onPress: handlePress,
          testID: `tab-${route.name}`,
        };

        return FEATURED_ROUTES.has(route.name) ? (
          <FeaturedTab key={route.key} {...tabProps} />
        ) : (
          <RegularTab key={route.key} {...tabProps} />
        );
      })}
    </View>
  );
};

export default TabBar;
