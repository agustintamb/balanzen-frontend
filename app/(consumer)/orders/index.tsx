import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Order } from "@/api/orders/orders.types";
import FilterChipBar from "@/components/FilterChipBar";
import FilterSheet, {
  FilterOptionChips,
  FilterOptionList,
  FilterSection,
} from "@/components/FilterSheet";
import OrderCard from "@/components/OrderCard";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import { safePush } from "@/utils/navigation";
import {
  DATE_FILTERS,
  FILTERS,
  SORT_FILTERS,
  useConsumerOrdersScreen,
} from "./useConsumerOrdersScreen";

const ItemSeparator = () => <View className="h-3" />;

const handleCardPress = (id: string) => safePush(`/order/${id}`);

const renderItem = ({ item }: ListRenderItemInfo<Order>) => (
  <OrderCard
    order={item}
    onPress={handleCardPress}
    hasUnreadMessages={item.unread_count > 0}
  />
);

const getEmptyText = (
  activeFilter: string,
  dateFilter: string,
  search: string,
): string => {
  if (search) return "No hay pedidos que coincidan con tu búsqueda.";
  if (dateFilter !== "all") return "No tenés pedidos en ese período.";
  if (activeFilter === "RESERVED") return "No tenés pedidos activos.";
  if (activeFilter === "DELIVERED") return "No tenés pedidos entregados.";
  if (activeFilter === "CANCELLED") return "No tenés pedidos cancelados.";
  return "Todavía no tenés pedidos.";
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const ConsumerOrders = () => {
  const {
    orders,
    isLoading,
    isError,
    isRefetching,
    activeFilter,
    dateFilter,
    hasActiveFilters,
    isFilterSheetVisible,
    pendingDateFilter,
    pendingSort,
    search,
    onSearchChange,
    handleFilterChange,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingDateChange,
    handlePendingSortChange,
    handleRefetch,
  } = useConsumerOrdersScreen();

  if (isError && orders.length === 0) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
          <View className="px-5 pt-5 pb-4">
            <Text className="font-sans-bold text-2xl text-primary-dark">
              Mis pedidos
            </Text>
          </View>
        </SafeAreaView>
        <View className="flex-1 bg-surface items-center justify-center">
          <Text className="font-sans text-base text-gray-400">
            No se pudieron cargar los pedidos.
          </Text>
        </View>
      </>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="px-5 pt-5 pb-4">
          <Text className="font-sans-bold text-2xl text-primary-dark">
            Mis pedidos
          </Text>
          {!isLoading && (
            <Text className="font-sans text-xs text-gray-400 mt-0.5">
              {orders.length}{" "}
              {orders.length === 1 ? "pedido en total" : "pedidos en total"}
            </Text>
          )}
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-surface">
        <FilterChipBar
          filters={FILTERS}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        <View className="flex-row items-center gap-3 px-5 pt-3 pb-2">
          <View className="flex-1">
            <Input
              value={search}
              onChangeText={onSearchChange}
              placeholder="Buscar pedidos..."
              leftIcon={<Icon name="search" size={18} color="muted" />}
              autoCapitalize="none"
              clearable
            />
          </View>
          <IconButton
            iconName="sliders"
            rotate="-90deg"
            active={hasActiveFilters}
            onPress={handleOpenFilterSheet}
            testID="btn-filter"
          />
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            isLoading ? null : (
              <View className="items-center justify-center pt-20 px-6">
                <Text className="font-sans text-base text-gray-400 text-center">
                  {getEmptyText(activeFilter, dateFilter, search)}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#639922" />
              </View>
            ) : null
          }
          ItemSeparatorComponent={ItemSeparator}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          style={{ flex: 1 }}
          refreshControl={
            <AppRefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefetch}
            />
          }
        />
      </View>

      <FilterSheet
        visible={isFilterSheetVisible}
        title="Filtros"
        onClose={handleCloseFilterSheet}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <FilterSection title="Fecha">
          <FilterOptionList
            options={DATE_FILTERS}
            selected={pendingDateFilter}
            onSelect={handlePendingDateChange}
          />
        </FilterSection>
        <FilterSection title="Ordenar por">
          <FilterOptionChips
            options={SORT_FILTERS}
            selected={pendingSort}
            onSelect={handlePendingSortChange}
          />
        </FilterSection>
      </FilterSheet>
    </KeyboardAvoidingView>
  );
};

export default ConsumerOrders;
