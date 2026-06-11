import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import Icon from "@/components/ui/Icon";
import { buildCardImageUrl } from "@/utils/cloudinary";
import type { Favorite } from "@/api/favorites/favorites.types";
import { useFavoritesScreen } from "./useFavoritesScreen";

const CARD_IMAGE_SIZE = 90;

const formatPrice = (n: number) =>
  `$${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

const formatExpiry = (dateStr: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (expiry.getTime() - today.getTime()) / 86400000,
  );
  if (diffDays < 0) return "Vencido";
  if (diffDays === 0) return "Vence hoy";
  if (diffDays === 1) return "Vence mañana";
  return `Vence en ${diffDays} días`;
};

const FavoriteCard = ({
  item,
  onRemove,
}: {
  item: Favorite;
  onRemove: (publicationId: string) => void;
}) => {
  const { publication } = item;
  const imageUrl = publication.photos[0]
    ? buildCardImageUrl(publication.photos[0])
    : null;
  const isDonation = publication.is_donation ?? false;

  return (
    <View
      className="bg-white rounded-2xl mx-4 mb-3 flex-row overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* Imagen con badge */}
      <View style={{ width: CARD_IMAGE_SIZE, height: CARD_IMAGE_SIZE }}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: CARD_IMAGE_SIZE, height: CARD_IMAGE_SIZE }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="bg-gray-100 items-center justify-center"
            style={{ width: CARD_IMAGE_SIZE, height: CARD_IMAGE_SIZE }}
          >
            <Icon name="image" size={24} color="muted" />
          </View>
        )}
        {isDonation ? (
          <View className="absolute top-2 left-0 bg-primary px-1.5 py-0.5 rounded-r">
            <Text
              className="text-white font-sans-semibold"
              style={{ fontSize: 10 }}
            >
              DONACIÓN
            </Text>
          </View>
        ) : publication.discount_pct > 0 ? (
          <View className="absolute top-2 left-0 bg-error px-1.5 py-0.5 rounded-r">
            <Text
              className="text-white font-sans-semibold"
              style={{ fontSize: 10 }}
            >
              -{publication.discount_pct}%
            </Text>
          </View>
        ) : null}
      </View>

      {/* Contenido */}
      <View className="flex-1 px-3 py-2.5">
        <View className="flex-row items-start justify-between">
          <Text
            className="font-sans-semibold text-sm text-primary-dark flex-1 pr-2"
            numberOfLines={2}
          >
            {publication.title}
          </Text>
          <TouchableOpacity
            onPress={() => onRemove(publication.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID={`btn-remove-favorite-${publication.id}`}
          >
            <Feather name="heart" size={20} color="#E84234" />
          </TouchableOpacity>
        </View>

        <Text
          className="font-sans text-xs text-gray-400 mt-1"
          numberOfLines={1}
        >
          {publication.commerce.business_name}
        </Text>

        {publication.expiry_date && (
          <View
            className="flex-row items-center mt-1"
            style={{ gap: 4 }}
          >
            <Feather name="clock" size={11} color="#9CA3AF" />
            <Text className="font-sans text-xs text-gray-400">
              {formatExpiry(publication.expiry_date)}
            </Text>
          </View>
        )}

        <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
          {isDonation ? (
            <Text className="font-sans-semibold text-sm text-primary">
              Gratis
            </Text>
          ) : (
            <>
              <Text className="font-sans-semibold text-sm text-primary-dark">
                {formatPrice(publication.final_price)}
              </Text>
              {publication.original_price > publication.final_price && (
                <Text className="font-sans text-xs text-gray-400 line-through">
                  {formatPrice(publication.original_price)}
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const FavoritesScreen = () => {
  const {
    favorites,
    total,
    isLoading,
    isRefetching,
    refetch,
    handleBack,
    handleRemove,
  } = useFavoritesScreen();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pt-2 pb-1">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <Icon name="chevron-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark">
            Mis favoritos
          </Text>
          {total > 0 ? (
            <View className="w-10 items-end pr-1">
              <View
                className="bg-primary rounded-full items-center justify-center"
                style={{ minWidth: 22, height: 22, paddingHorizontal: 5 }}
              >
                <Text
                  className="text-white font-sans-semibold"
                  style={{ fontSize: 11 }}
                >
                  {total}
                </Text>
              </View>
            </View>
          ) : (
            <View className="w-10" />
          )}
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-surface">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#639922" />
          </View>
        ) : favorites.length === 0 ? (
          <View
            className="flex-1 items-center justify-center px-8"
            style={{ gap: 12 }}
          >
            <Icon name="heart" size={40} color="muted" />
            <Text className="font-sans-semibold text-base text-primary-dark text-center">
              Todavía no tenés favoritos
            </Text>
            <Text className="font-sans text-sm text-gray-400 text-center">
              Guardá publicaciones que te interesen para encontrarlas fácilmente.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <FavoriteCard item={item} onRemove={handleRemove} />
            )}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#639922"
              />
            }
          />
        )}
      </View>
    </>
  );
};

export default FavoritesScreen;
