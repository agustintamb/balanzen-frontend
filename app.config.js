import "dotenv/config";

const appConfig = ({ config }) => {
  const appEnv = process.env.APP_ENV || "local";

  return {
    ...config, // toma lo de app.json
    name: "Balanzen",
    slug: "balanzen",
    version: "1.0.0",
    extra: {
      appEnv,
      apiLocalDeviceUrl: process.env.API_LOCAL_DEVICE_URL ?? "",
      apiLocalPort: process.env.API_LOCAL_PORT ?? "3001",
    },
  };
};

export default appConfig;
