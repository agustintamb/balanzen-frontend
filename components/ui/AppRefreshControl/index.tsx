import { RefreshControl, type RefreshControlProps } from "react-native";

interface AppRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const AppRefreshControl = ({
  refreshing,
  onRefresh,
  ...rest
}: AppRefreshControlProps & Record<string, unknown>) => (
  <RefreshControl
    {...(rest as Partial<RefreshControlProps>)}
    refreshing={refreshing}
    onRefresh={onRefresh}
    tintColor="#639922"
    colors={["#639922"]}
  />
);

export default AppRefreshControl;
