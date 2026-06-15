import { Platform } from "react-native";
import Constants from "expo-constants";

const PORT = Constants.expoConfig?.extra?.apiLocalPort || "3001";

const getLocalApiUrl = (): string => {
  const manualUrl = Constants.expoConfig?.extra?.apiLocalDeviceUrl;
  if (manualUrl) return manualUrl;

  if (Platform.OS === "android") return `http://10.0.2.2:${PORT}/api/v1`;
  return `http://localhost:${PORT}/api/v1`;
};

const ENV = {
  local: {
    API_URL: getLocalApiUrl(),
    ENV_NAME: "local",
  },
  testing: {
    API_URL: "https://balanzen-backend-testing.up.railway.app/api/v1",
    ENV_NAME: "testing",
  },
  production: {
    API_URL: "https://balanzen-backend-production.up.railway.app/api/v1",
    ENV_NAME: "production",
  },
};

const getEnvConfig = () => {
  const appEnv = (Constants.expoConfig?.extra?.appEnv as string) || "local";
  const config = ENV[appEnv as keyof typeof ENV] || ENV.local;
  // Host base para WebSocket (socket.io): la API_URL sin el sufijo `/api/v1`.
  const SOCKET_URL = config.API_URL.replace(/\/api\/v1\/?$/, "");
  return { ...config, SOCKET_URL };
};

export default getEnvConfig();
