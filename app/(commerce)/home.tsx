import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useMetricsSummary } from "@/hooks/useMetrics";
import { useMyPublications } from "@/hooks/usePublications";
import { useNotifications } from "@/hooks/useNotifications";
import { useOrders } from "@/hooks/useOrders";
import { useCurrentUser } from "@/hooks/useUsers";
import { safePush } from "@/utils/navigation";
import { cn } from "@/utils/cn";
import Icon from "@/components/ui/Icon";
import MetricCard from "@/components/commerce/MetricCard";
import PublicationListCard from "@/components/commerce/PublicationListCard";
import type {
  Publication,
  PublicationStatus,
} from "@/api/publications/publications.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterKey = PublicationStatus | "ALL";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "Todas" },
  { key: "ACTIVE", label: "Activas" },
  { key: "RESERVED", label: "Reservadas" },
  { key: "DELIVERED", label: "Entregadas" },
  { key: "CANCELLED", label: "Canceladas" },
  { key: "EXPIRED", label: "Vencidas" },
];

const EMPTY_LABEL: Record<FilterKey, string> = {
  ALL: "Todavía no tenés publicaciones.",
  ACTIVE: "No tenés publicaciones activas.",
  RESERVED: "No tenés publicaciones reservadas.",
  DELIVERED: "No tenés publicaciones entregadas.",
  CANCELLED: "No tenés publicaciones canceladas.",
  EXPIRED: "No tenés publicaciones vencidas.",
};

// ─── Sub-components (defined outside to keep stable references for FlatList) ──

interface HomeHeaderProps {
  businessName: string;
  unreadCount: number;
  onBellPress: () => void;
}

const HomeHeader = ({
  businessName,
  unreadCount,
  onBellPress,
}: HomeHeaderProps) => (
  <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
    <Text
      className="flex-1 mr-3 font-sans-bold text-xl text-primary-dark"
      numberOfLines={1}
    >
      {businessName}
    </Text>
    <TouchableOpacity
      onPress={onBellPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID="btn-notifications"
    >
      <View className="relative">
        <Icon name="bell" size={24} color="primary-dark" />
        {unreadCount > 0 && (
          <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-error rounded-full border border-surface" />
        )}
      </View>
    </TouchableOpacity>
  </View>
);

interface ListHeaderProps {
  totalPublications: number;
  activeReservations: number;
  activeFilter: FilterKey;
  onFilterChange: (key: FilterKey) => void;
}

const ListHeader = ({
  totalPublications,
  activeReservations,
  activeFilter,
  onFilterChange,
}: ListHeaderProps) => (
  <>
    <View className="flex-row gap-3 px-4 pt-4 pb-6">
      <MetricCard
        icon="file-text"
        value={totalPublications}
        label="Publicaciones"
        variant="green"
      />
      <MetricCard
        icon="shopping-bag"
        value={activeReservations}
        label="Reservas activas"
        variant="orange"
      />
    </View>

    <Text className="font-sans-bold text-lg text-primary-dark px-4 mb-3">
      Mis publicaciones
    </Text>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
    >
      {FILTERS.map(({ key, label }) => {
        const isSelected = activeFilter === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onFilterChange(key)}
            className={cn(
              "rounded-full px-4 py-2",
              isSelected ? "bg-primary-dark" : "bg-surface-dark",
            )}
            activeOpacity={0.75}
            testID={`filter-${key}`}
          >
            <Text
              className={cn(
                "font-sans-medium text-sm",
                isSelected ? "text-white" : "text-gray-500",
              )}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

const ItemSeparator = () => <View className="h-3" />;

const CommerceHome = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();
  const { data: metrics } = useMetricsSummary();
  // API has no "reservations today" endpoint. We query orders with status=RESERVED
  // and use pagination.total as the count of currently active reservations.
  const { data: reservedOrders } = useOrders({ status: "RESERVED", limit: 1 });

  const {
    data: publicationsData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyPublications(
    activeFilter === "ALL" ? undefined : { status: activeFilter },
  );

  const businessName =
    user?.business_name ??
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const unreadCount = notifications?.unread_count ?? 0;
  const totalPublications = metrics?.total_publications ?? 0;
  const activeReservations = reservedOrders?.pagination.total ?? 0;
  const publications = publicationsData?.publications ?? [];

  const handleBell = useCallback(() => safePush("/notifications"), []);
  const handleFilterChange = useCallback(
    (key: FilterKey) => setActiveFilter(key),
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Publication>) => (
      <PublicationListCard publication={item} />
    ),
    [],
  );

  if (isError && publications.length === 0) {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView edges={["top", "left", "right"]} className="bg-surface">
          <HomeHeader
            businessName={businessName}
            unreadCount={unreadCount}
            onBellPress={handleBell}
          />
        </SafeAreaView>
        <View className="flex-1 bg-surface items-center justify-center px-8">
          <Icon name="wifi-off" size={40} color="muted" />
          <Text className="font-sans-medium text-base text-gray-500 mt-3 text-center">
            No pudimos cargar los datos. Revisá tu conexión.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 px-5 py-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="font-sans-semibold text-sm text-primary">
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-surface">
        <HomeHeader
          businessName={businessName}
          unreadCount={unreadCount}
          onBellPress={handleBell}
        />
      </SafeAreaView>

      <FlatList
        data={publications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        // Passing element (not a function ref) avoids header remounting when filter changes
        ListHeaderComponent={
          <ListHeader
            totalPublications={totalPublications}
            activeReservations={activeReservations}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center justify-center pt-12 px-8">
              <Icon name="package" size={40} color="muted" />
              <Text className="font-sans-medium text-base text-gray-500 mt-3 text-center">
                {EMPTY_LABEL[activeFilter]}
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
        contentContainerStyle={{ paddingBottom: 24 }}
        style={{ backgroundColor: "#F1EFE8" }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#639922"
            colors={["#639922"]}
          />
        }
        testID="publications-list"
      />
    </>
  );
};

export default CommerceHome;
