/**
 * app.config.js extiende app.json con valores dinámicos del entorno.
 * Expo carga .env.local automáticamente antes de evaluar este archivo.
 *
 * El objeto `config` recibe el contenido de app.json como base.
 */
const defineConfig = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY ?? "";
  const apiLocalPort = process.env.API_LOCAL_PORT ?? "3001";
  const apiLocalDeviceUrl = process.env.API_LOCAL_DEVICE_URL ?? "";
  const appEnv = process.env.APP_ENV ?? "local";

  // Reemplaza el plugin estático "react-native-maps" por la versión
  // con la API key de Android leída desde el entorno.
  const plugins = (config.plugins ?? []).map((plugin) => {
    if (plugin === "react-native-maps") {
      return [
        "react-native-maps",
        { androidGoogleMapsApiKey: googleMapsApiKey },
      ];
    }
    return plugin;
  });

  return {
    ...config,
    android: {
      ...config.android,
      config: {
        googleMaps: { apiKey: googleMapsApiKey },
      },
    },
    plugins,
    extra: {
      ...config.extra,
      apiLocalPort,
      apiLocalDeviceUrl,
      appEnv,
    },
  };
};

module.exports = defineConfig;
