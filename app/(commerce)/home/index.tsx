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
import type { Publication } from "@/api/publications/publications.types";
import FilterChipBar from "@/components/FilterChipBar";
import FilterSheet, {
  FilterOptionChips,
  FilterOptionList,
  FilterSection,
} from "@/components/FilterSheet";
import HomeErrorBody from "@/components/HomeErrorBody";
import ProductCard from "@/components/ProductCard";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import { safePush } from "@/utils/navigation";
import HomeHeader from "./components/HomeHeader";
import HomeListEmpty from "./components/HomeListEmpty";
import MetricCard from "./components/MetricCard";
import {
  DATE_FILTERS,
  FILTERS,
  SORT_FILTERS,
  useCommerceHomeScreen,
} from "./useCommerceHomeScreen";

const ItemSeparator = () => <View className="h-3" />;

// Si la publicación está reservada, el comercio entra al detalle de la orden
// (con el consumidor y acciones); si no, al detalle de la publicación.
const handleCardPress = (publication: Publication) => {
  if (publication.status === "RESERVED" && publication.order_id) {
    safePush(`/order/${publication.order_id}`);
  } else {
    safePush(`/publication/${publication.id}`);
  }
};

const renderItem = ({ item }: ListRenderItemInfo<Publication>) => (
  <ProductCard
    publication={item}
    onPress={() => handleCardPress(item)}
    hasUnreadMessages={(item.unread_count ?? 0) > 0}
    showDate
    showExpiryWarning
  />
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const CommerceHome = () => {
  const {
    businessName,
    unreadCount,
    activeReservations,
    expiringSoonCount,
    publications,
    search,
    isLoading,
    isError,
    isRefetching,
    activeFilter,
    hasActiveFilters,
    isFilterSheetVisible,
    pendingDateFilter,
    pendingSort,
    handleRefetch,
    handleBell,
    handleFilterChange,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingDateChange,
    handlePendingSortChange,
    onSearchChange,
  } = useCommerceHomeScreen();

  if (isError && publications.length === 0) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
          <View className="px-5 pt-5 pb-4">
            <HomeHeader
              businessName={businessName}
              unreadCount={unreadCount}
              onBellPress={handleBell}
            />
          </View>
        </SafeAreaView>
        <HomeErrorBody onRetry={handleRefetch} />
      </>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="px-5 pt-5 pb-4">
          <HomeHeader
            businessName={businessName}
            unreadCount={unreadCount}
            onBellPress={handleBell}
          />
          <View className="flex-row gap-3 mt-5">
            <MetricCard
              icon="shopping-bag"
              value={activeReservations}
              label={activeReservations === 1 ? "Reserva" : "Reservas activas"}
              variant="green"
            />
            <MetricCard
              icon="clock"
              value={expiringSoonCount}
              label={expiringSoonCount === 1 ? "Vence pronto" : "Vencen pronto"}
              variant="orange"
            />
          </View>
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-surface">
        <Text className="font-sans-bold text-lg text-primary-dark px-5 pt-5 pb-1">
          Mis publicaciones
        </Text>

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
              placeholder="Buscar publicaciones..."
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

        {!isLoading && (
          <Text className="font-sans text-xs text-gray-400 px-5 pt-1 pb-3">
            {publications.length}{" "}
            {publications.length === 1 ? "publicación" : "publicaciones"}
          </Text>
        )}

        <FlatList
          data={publications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            isLoading ? null : <HomeListEmpty filter={activeFilter} />
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
          testID="publications-list"
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

export default CommerceHome;
