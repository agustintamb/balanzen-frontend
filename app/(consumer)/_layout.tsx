import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBar from "@/components/TabBar";

const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

const ConsumerLayout = () => (
  <Tabs
    screenOptions={{
      headerShown: false,
      sceneStyle: { backgroundColor: "#F1EFE8" },
    }}
    tabBar={renderTabBar}
    backBehavior="firstRoute"
  >
    <Tabs.Screen name="home" />
    <Tabs.Screen name="orders" />
    <Tabs.Screen name="profile" />
  </Tabs>
);

export default ConsumerLayout;
