/**
 * En Expo Go, react-native-maps no está disponible → muestra un placeholder.
 * En el dev client (expo-dev-client) o en builds de producción, carga el MapView real.
 *
 * Flujo de desarrollo:
 *   1. Primera vez: npx expo run:android   (compila + instala el dev client con módulos nativos)
 *   2. Resto del tiempo: npx expo start    (el dev client se conecta automáticamente)
 */
import { StyleSheet, Text, View } from "react-native";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let NativeMapView: React.ComponentType<any> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  NativeMapView = require("react-native-maps").default;
} catch {
  // El módulo nativo no está disponible (Expo Go — usa el dev client para tenerlo)
}

export const MAPS_AVAILABLE = !!NativeMapView;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MapFallback = ({ style, children }: any) => (
  <View style={[style, styles.fallback]}>
    <View style={styles.card}>
      <Text style={styles.message}>
        {"Mapa no disponible en Expo Go.\n\nEjecutá una vez:\n"}
        <Text style={styles.command}>npx expo run:android</Text>
        {"\n\nDespués usá npx expo start normalmente."}
      </Text>
    </View>
    {children}
  </View>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SafeMapView: React.ComponentType<any> =
  NativeMapView ?? MapFallback;

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: "#E3E0D8",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 16,
    padding: 24,
    margin: 24,
  },
  message: {
    fontSize: 13,
    color: "#27500A",
    textAlign: "center",
    lineHeight: 22,
  },
  command: {
    fontWeight: "700",
    fontSize: 13,
  },
});

// Expo Router requires a default export in app/ — this is a utility component, not a screen
export default SafeMapView;
