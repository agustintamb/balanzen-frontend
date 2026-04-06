import Constants from "expo-constants";

const ENV = {
  local: {
    API_URL: Constants.expoConfig?.extra?.apiLocalUrl,
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
  const appEnv = Constants.expoConfig?.extra?.appEnv || "local";
  return ENV[appEnv] || ENV.local;
};

export default getEnvConfig();