import envConfig from "@/config/env";
import { useHealth } from "@/hooks/useHealth";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { data, isError, error, refetch, isFetching } = useHealth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Balanzen</Text>
      <Text style={styles.subtitle}>Health Check</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Ambiente</Text>
        <Text style={styles.infoValue}>{envConfig.ENV_NAME}</Text>
        <Text style={styles.infoLabel}>API URL</Text>
        <Text style={styles.infoValue}>{envConfig.API_URL}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isFetching && styles.buttonDisabled]}
        disabled={isFetching}
        onPress={() => {
          refetch();
        }}
      >
        {isFetching ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Ping al backend</Text>
        )}
      </TouchableOpacity>

      {/* Reemplazás el bloque de error, loading y success por esto */}

      <View style={styles.resultContainer}>
        {isFetching && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Conectando...</Text>
          </View>
        )}

        {!isFetching && isError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>❌ Error de conexión</Text>
            <Text style={styles.errorText}>Mensaje: {error.message}</Text>
            <Text style={styles.errorHint}>
              {
                "Verificá que:\n• El backend esté corriendo\n• Estés en la misma red WiFi"
              }
            </Text>
          </View>
        )}

        {!isFetching && !isError && data && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>✅ Conectado</Text>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Mensaje</Text>
              <Text style={styles.rowValue}>{data.message}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Ambiente</Text>
              <Text style={styles.rowValue}>{data.environment}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Base de datos</Text>
              <Text
                style={[
                  styles.rowValue,
                  data.database?.status === "connected"
                    ? styles.dbConnected
                    : styles.dbDisconnected,
                ]}
              >
                {data.database?.status} ({data.database?.name})
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Uptime</Text>
              <Text style={styles.rowValue}>{data.uptime}</Text>
            </View>
          </View>
        )}

        {!isFetching && !isError && !data && (
          <View style={styles.placeholderBox} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 8,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 13,
    color: "#cbd5e1",
    fontFamily: "monospace",
  },
  button: {
    width: "100%",
    backgroundColor: "#6366f1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#450a0a",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#7f1d1d",
    gap: 8,
  },
  errorTitle: {
    color: "#fca5a5",
    fontWeight: "700",
    fontSize: 15,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
    fontFamily: "monospace",
  },
  errorHint: {
    color: "#f87171",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 20,
  },
  loadingBox: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  successBox: {
    width: "100%",
    backgroundColor: "#052e16",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#14532d",
    gap: 4,
  },
  successTitle: {
    color: "#86efac",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#14532d",
  },
  rowLabel: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  rowValue: {
    color: "#bbf7d0",
    fontSize: 12,
    fontFamily: "monospace",
    flex: 2,
    textAlign: "right",
  },
  resultContainer: {
    width: "100%",
    minHeight: 220,
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeholderText: {
    color: "#475569",
    fontSize: 13,
  },
  placeholderBox: {
    width: "100%",
    minHeight: 200,
  },
  dbConnected: { color: "#4ade80", fontWeight: "700" },
  dbDisconnected: { color: "#f87171", fontWeight: "700" },
});
