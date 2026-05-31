import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBar from "@/components/TabBar";

const renderTabBar = (props: BottomTabBarProps) => <TabBar {...props} />;

const CommerceLayout = () => (
  <Tabs screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
    <Tabs.Screen name="home" />
    <Tabs.Screen name="publications" />
    <Tabs.Screen name="profile" />
  </Tabs>
);

export default CommerceLayout;
