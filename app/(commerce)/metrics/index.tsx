import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Icon, { IconColor, IconName } from "@/components/ui/Icon";
import { useMetricsScreen } from "./useMetricsScreen";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  color: IconColor;
}

const MetricCard = ({ label, value, icon, color }: MetricCardProps) => (
  <View
    className="flex-row items-center bg-white rounded-[24px] p-4 mb-4"
    style={{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    }}
  >
    <View className="mr-4">
      <Icon
        name={icon}
        size={20}
        variant="soft"
        color={color}
        containerSize={48}
      />
    </View>
    <Text className="flex-1 font-sans text-gray-400 text-base">{label}</Text>
    <Text className="font-sans-bold text-2xl text-primary-dark">{value}</Text>
  </View>
);

const MetricsScreen = () => {
  const { metrics, isLoading, handleBack, refetch } = useMetricsScreen();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace("ARS", "$");
  };

  // El campo de dinero recuperado no está en la API aún, se muestra 0 por ahora
  const recoveredAmount = 0;

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        {/* Header */}
        <View className="px-4 pt-2 pb-6">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              testID="btn-back"
            >
              <Icon name="arrow-left" size={20} color="primary-dark" />
            </TouchableOpacity>
            <View>
              <Text className="font-sans-bold text-xl text-primary-dark">
                Mis métricas
              </Text>
              <Text className="font-sans text-sm text-gray-400">
                Rendimiento de tu negocio
              </Text>
            </View>
          </View>
        </View>
        <View className="h-[1px] bg-gray-100" />
      </SafeAreaView>

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="px-4 pt-8 pb-10"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#639922"]}
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
              label="$ recuperado"
              value={formatCurrency(recoveredAmount)}
              icon="dollar-sign"
              color="warning"
            />
          </>
        )}
      </ScrollView>
    </>
  );
};

export default MetricsScreen;
