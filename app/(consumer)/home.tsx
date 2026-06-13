import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Publication } from "@/api/publications/publications.types";
import AppRefreshControl from "@/components/ui/AppRefreshControl";
import ConsumerPublicationCard from "@/components/ui/ConsumerPublicationCard";
import FilterChipBar from "@/components/ui/FilterChipBar";
import FilterSheet, {
  FilterOptionChips,
  FilterOptionList,
  FilterSection,
} from "@/components/ui/FilterSheet";
import Icon from "@/components/ui/Icon";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";
import {
  MAX_RADIUS_FILTERS,
  PUB_TYPE_FILTERS,
  SORT_FILTERS,
  useConsumerHomeScreen,
} from "./useConsumerHomeScreen";

const ItemSeparator = () => <View className="h-3" />;

const renderItem = ({ item }: ListRenderItemInfo<Publication>) => (
  <ConsumerPublicationCard publication={item} />
);

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  firstName: string;
  selectedAddress: string | null;
  unreadCount: number;
  onBellPress: () => void;
}

const Header = ({
  firstName,
  selectedAddress,
  unreadCount,
  onBellPress,
}: HeaderProps) => (
  <View>
    {selectedAddress && (
      <View className="flex-row items-center gap-1 mb-1.5">
        <Icon name="map-pin" size={11} color="primary" />
        <Text
          className="font-sans text-xs text-gray-400 flex-1"
          numberOfLines={1}
        >
          {selectedAddress}
        </Text>
      </View>
    )}
    <View className="flex-row items-center justify-between">
      <Text
        className="flex-1 mr-4 font-sans-bold text-xl text-gray-900"
        numberOfLines={1}
      >
        {firstName ? `¡Hola, ${firstName}! 👋` : "BalanZen"}
      </Text>
      <TouchableOpacity
        onPress={onBellPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        testID="btn-notifications"
      >
        <View
          className="bg-gray-100 items-center justify-center"
          style={{ width: 44, height: 44, borderRadius: 22 }}
        >
          <Icon name="bell" size={20} color="dark" />
          {unreadCount > 0 && (
            <View
              className="absolute bg-error rounded-full border-2 border-white"
              style={{ width: 10, height: 10, top: 10, right: 10 }}
            />
          )}
        </View>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const ConsumerHome = () => {
  const {
    firstName,
    selectedAddress,
    unreadCount,
    categoryFilters,
    publications,
    selectedCategory,
    search,
    isLoading,
    isError,
    isRefetching,
    hasLatLng,
    hasActiveFilters,
    isFilterSheetVisible,
    pendingPubType,
    pendingMaxRadius,
    pendingSortBy,
    onSearchChange,
    handleCategoryChange,
    handleBell,
    handleRefetch,
    handleOpenFilterSheet,
    handleCloseFilterSheet,
    handleApplyFilters,
    handleResetFilters,
    handlePendingPubTypeChange,
    handlePendingMaxRadiusChange,
    handlePendingSortByChange,
  } = useConsumerHomeScreen();

  if (isError && publications.length === 0) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
          <View className="px-5 pt-5 pb-4">
            <Header
              firstName={firstName}
              selectedAddress={selectedAddress}
              unreadCount={unreadCount}
              onBellPress={handleBell}
            />
          </View>
        </SafeAreaView>
        <View className="flex-1 bg-surface items-center justify-center">
          <Text className="font-sans text-base text-gray-400">
            No se pudieron cargar las publicaciones.
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
          <Header
            firstName={firstName}
            selectedAddress={selectedAddress}
            unreadCount={unreadCount}
            onBellPress={handleBell}
          />
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-surface">
        <Text className="font-sans-bold text-lg text-primary-dark px-5 pt-5 pb-1">
          Publicaciones cercanas
        </Text>

        <FilterChipBar
          filters={categoryFilters}
          activeFilter={selectedCategory}
          onFilterChange={handleCategoryChange}
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
            isLoading ? null : (
              <View className="items-center justify-center pt-20 px-6">
                <Text className="font-sans text-base text-gray-400 text-center">
                  No hay publicaciones disponibles.
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
        <FilterSection title="Tipo de publicación">
          <FilterOptionChips
            options={PUB_TYPE_FILTERS}
            selected={pendingPubType}
            onSelect={handlePendingPubTypeChange}
          />
        </FilterSection>
        {hasLatLng && (
          <FilterSection title="Distancia máxima">
            <FilterOptionList
              options={MAX_RADIUS_FILTERS}
              selected={pendingMaxRadius}
              onSelect={handlePendingMaxRadiusChange}
            />
          </FilterSection>
        )}
        <FilterSection title="Ordenar por">
          <FilterOptionChips
            options={SORT_FILTERS.filter(
              (f) => f.key !== "distance" || hasLatLng,
            )}
            selected={pendingSortBy}
            onSelect={handlePendingSortByChange}
          />
        </FilterSection>
      </FilterSheet>
    </KeyboardAvoidingView>
  );
};

export default ConsumerHome;
