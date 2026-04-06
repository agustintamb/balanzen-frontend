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
      apiLocalUrl: process.env.API_LOCAL_URL,
    },
  };
};

export default appConfig;
