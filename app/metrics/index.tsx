import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
import Icon from "@/components/ui/Icon";
import MetricCard from "./MetricCard";
import { useMetricsScreen } from "./useMetricsScreen";

const MetricsScreen = () => {
  const { metrics, isLoading, handleBack, refetch } = useMetricsScreen();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pt-6 pb-4">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="chevron-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark">
            Mis métricas
          </Text>
          <View className="w-10" />
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="px-4 pt-8 pb-10"
        refreshControl={
          <AppRefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
          />
        }
      >
        <Text className="font-sans-bold text-xs text-gray-400 uppercase tracking-widest mb-4 ml-1">
          Resumen General
        </Text>

        {isLoading && !metrics ? (
          <View className="py-20">
            <ActivityIndicator size="large" color="#639922" />
          </View>
        ) : (
          <>
            <MetricCard
              label="Publicaciones activas"
              value={metrics?.active_publications ?? 0}
              icon="package"
              color="primary"
            />
            <MetricCard
              label="Reserva recibidas"
              value={metrics?.total_reservations ?? 0}
              icon="shopping-bag"
              color="primary"
            />
            <MetricCard
              label="Entregas realizadas"
              value={metrics?.total_delivered ?? 0}
              icon="check-circle"
              color="primary"
            />
            <MetricCard
              label="Cancelaciones"
              value={metrics?.total_cancelled ?? 0}
              icon="x-circle"
              color="error"
            />
          </>
        )}
      </ScrollView>
    </>
  );
};

export default MetricsScreen;
