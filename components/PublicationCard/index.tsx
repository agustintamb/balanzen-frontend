import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

export interface PublicationCardProps {
  title: string;
  businessName: string;
  image?: string;
  originalPrice: number;
  finalPrice: number;
  discountPct: number;
  distanceKm?: number;
  expiryText: string;
  isDonation?: boolean;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  className?: string;
  testID?: string;
}

const PublicationCard = ({
  title,
  businessName,
  image,
  originalPrice,
  finalPrice,
  discountPct,
  distanceKm,
  expiryText,
  isDonation = false,
  isFavorite = false,
  onPress,
  onFavoritePress,
  className,
  testID,
}: PublicationCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("ARS", "$");
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className={cn(
        "flex-row bg-white rounded-[24px] overflow-hidden p-3 mb-4",
        className,
      )}
      testID={testID}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Image Section */}
      <View className="relative w-28 h-28 rounded-2xl overflow-hidden">
        <Image
          source={image}
          contentFit="cover"
          className="w-full h-full bg-surface-dark"
        />
        {/* Tag */}
        <View
          className={cn(
            "absolute top-2 left-2 px-2 py-1 rounded-full",
            isDonation ? "bg-primary-dark" : "bg-error",
          )}
        >
          <Text className="text-[10px] font-sans-bold text-white uppercase">
            {isDonation ? "Donación" : `-${discountPct}%`}
          </Text>
        </View>
      </View>

      {/* Info Section */}
      <View className="flex-1 ml-4 justify-between py-1">
        <View>
          <Text
            className="font-sans-semibold text-base text-primary-dark"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text className="font-sans text-xs text-gray-400" numberOfLines={1}>
            {businessName}
          </Text>

          <View className="flex-row items-center mt-2 gap-3">
            <View className="flex-row items-center gap-1">
              <Icon name="map-pin" size={12} color="primary" />
              <Text className="font-sans text-[11px] text-gray-500">
                {distanceKm !== undefined ? `${distanceKm} km` : "-- km"}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Icon name="clock" size={12} color="warning" />
              <Text className="font-sans text-[11px] text-gray-500">
                {expiryText}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-end justify-between">
          <View>
            {isDonation ? (
              <Text className="font-sans-bold text-base text-primary">
                Gratis
              </Text>
            ) : (
              <View className="flex-row items-center gap-1.5">
                <Text className="font-sans-bold text-base text-primary-dark">
                  {formatPrice(finalPrice)}
                </Text>
                <Text className="font-sans text-xs text-gray-300 line-through">
                  {formatPrice(originalPrice)}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress?.();
            }}
            className="w-8 h-8 rounded-full bg-error-light items-center justify-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="heart"
              size={14}
              color="error"
              variant={isFavorite ? "filled" : "plain"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PublicationCard;
