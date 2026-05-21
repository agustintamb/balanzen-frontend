import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import envConfig from "@/config/env";
import { cn } from "@/utils/cn";
import { useHomeScreen } from "./useHomeScreen";

export default function HomeScreen() {
  const { data, isError, error, refetch, isFetching } = useHomeScreen();

  return (
    <ScrollView contentContainerClassName="flex-grow bg-slate-900 items-center justify-center p-6 gap-4">
      <Text className="text-4xl font-sans-bold text-slate-50 -tracking-wide">
        Balanzen
      </Text>
      <Text className="text-sm text-slate-400 mb-2">Health Check</Text>

      <View className="w-full bg-slate-800 rounded-xl p-4 gap-1">
        <Text className="text-xs text-slate-500 uppercase tracking-widest mt-2">
          Ambiente
        </Text>
        <Text className="text-sm text-slate-300">{envConfig.ENV_NAME}</Text>
        <Text className="text-xs text-slate-500 uppercase tracking-widest mt-2">
          API URL
        </Text>
        <Text className="text-sm text-slate-300">{envConfig.API_URL}</Text>
      </View>

      <TouchableOpacity
        className={cn(
          "w-full bg-indigo-500 py-4 rounded-xl items-center",
          isFetching && "opacity-60",
        )}
        disabled={isFetching}
        onPress={() => refetch()}
      >
        {isFetching ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-sans-semibold">
            Ping al backend
          </Text>
        )}
      </TouchableOpacity>

      <View className="w-full min-h-[220px] justify-center">
        {isFetching && (
          <View className="items-center gap-3">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="text-sm text-slate-400">Conectando...</Text>
          </View>
        )}

        {!isFetching && isError && (
          <View className="w-full bg-red-950 rounded-xl p-4 border border-red-900 gap-2">
            <Text className="text-sm font-sans-bold text-red-300">
              ❌ Error de conexión
            </Text>
            <Text className="text-sm text-red-300">
              Mensaje: {error.message}
            </Text>
            <Text className="text-xs text-red-400 mt-1 leading-5">
              {
                "Verificá que:\n• El backend esté corriendo\n• Estés en la misma red WiFi"
              }
            </Text>
          </View>
        )}

        {!isFetching && !isError && data && (
          <View className="w-full bg-green-950 rounded-xl p-4 border border-green-900 gap-1">
            <Text className="text-sm font-sans-bold text-green-300 mb-2">
              ✅ Conectado
            </Text>
            <View className="flex-row justify-between py-1 border-b border-green-900">
              <Text className="text-xs font-sans-semibold text-green-400 flex-1">
                Mensaje
              </Text>
              <Text className="text-xs text-green-200 flex-[2] text-right">
                {data.message}
              </Text>
            </View>
            <View className="flex-row justify-between py-1 border-b border-green-900">
              <Text className="text-xs font-sans-semibold text-green-400 flex-1">
                Ambiente
              </Text>
              <Text className="text-xs text-green-200 flex-[2] text-right">
                {data.environment}
              </Text>
            </View>
            <View className="flex-row justify-between py-1 border-b border-green-900">
              <Text className="text-xs font-sans-semibold text-green-400 flex-1">
                Base de datos
              </Text>
              <Text
                className={cn(
                  "text-xs flex-[2] text-right font-sans-bold",
                  data.database?.status === "connected"
                    ? "text-green-400"
                    : "text-red-400",
                )}
              >
                {data.database?.status} ({data.database?.name})
              </Text>
            </View>
            <View className="flex-row justify-between py-1 border-b border-green-900">
              <Text className="text-xs font-sans-semibold text-green-400 flex-1">
                Uptime
              </Text>
              <Text className="text-xs text-green-200 flex-[2] text-right">
                {data.uptime}
              </Text>
            </View>
          </View>
        )}

        {!isFetching && !isError && !data && (
          <View className="w-full min-h-[200px]" />
        )}
      </View>
    </ScrollView>
  );
}
