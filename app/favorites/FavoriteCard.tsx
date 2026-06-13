import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Favorite } from "@/api/favorites/favorites.types";
import Icon from "@/components/ui/Icon";
import { buildCardImageUrl } from "@/utils/cloudinary";
import { formatExpiry, formatPrice } from "@/utils/format";

const IMAGE_WIDTH = 116;

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.07,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

const IMAGE_FILL = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

interface FavoriteCardProps {
  item: Favorite;
  onRemove: (publicationId: string) => void;
}

const FavoriteCard = React.memo(({ item, onRemove }: FavoriteCardProps) => {
  const { publication } = item;
  const imageUrl = publication.photos[0]
    ? buildCardImageUrl(publication.photos[0])
    : null;
  const isDonation = publication.is_donation ?? false;

  let badge: React.ReactNode = null;
  if (isDonation) {
    badge = (
      <View className="absolute top-2 left-2 bg-primary rounded-full px-2 py-0.5">
        <Text
          className="text-white font-sans-semibold"
          style={{ fontSize: 10 }}
        >
          DONACIÓN
        </Text>
      </View>
    );
  } else if (publication.discount_pct > 0) {
    badge = (
      <View className="absolute top-2 left-2 bg-error rounded-full px-2 py-0.5">
        <Text
          className="text-white font-sans-semibold"
          style={{ fontSize: 10 }}
        >
          -{publication.discount_pct}%
        </Text>
      </View>
    );
  }

  return (
    <View
      className="bg-white rounded-2xl mx-4 mb-3 flex-row overflow-hidden"
      style={CARD_SHADOW}
    >
      <View style={{ width: IMAGE_WIDTH, alignSelf: "stretch" }}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={IMAGE_FILL}
            resizeMode="cover"
          />
        ) : (
          <View
            className="bg-gray-100 items-center justify-center"
            style={IMAGE_FILL}
          >
            <Icon name="image" size={24} color="muted" />
          </View>
        )}

        {badge}
      </View>

      <View className="flex-1 px-3 pt-3 pb-3" style={{ gap: 3 }}>
        <Text
          className="font-sans-semibold text-sm text-primary-dark"
          numberOfLines={2}
        >
          {publication.title}
        </Text>

        <Text className="font-sans text-xs text-gray-400" numberOfLines={1}>
          {publication.commerce.business_name}
        </Text>

        <View className="flex-row items-center mt-0.5" style={{ gap: 8 }}>
          <View
            className="flex-row items-center flex-1 min-w-0"
            style={{ gap: 3 }}
          >
            <Icon name="map-pin" size={11} color="primary" />
            <Text
              className="font-sans text-xs text-gray-400 flex-1"
              numberOfLines={1}
            >
              {publication.commerce.selected_address.formatted_address}
            </Text>
          </View>
          {publication.expiry_date && (
            <View
              className="flex-row items-center"
              style={{ gap: 3, flexShrink: 0 }}
            >
              <Icon name="clock" size={11} color="muted" />
              <Text className="font-sans text-xs text-gray-400">
                {formatExpiry(publication.expiry_date)}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-row items-center" style={{ gap: 6 }}>
            {isDonation ? (
              <Text className="font-sans-semibold text-lg text-primary">
                Gratis
              </Text>
            ) : (
              <>
                <Text className="font-sans-semibold text-lg text-primary-dark">
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

          <TouchableOpacity
            onPress={() => onRemove(publication.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID={`btn-remove-favorite-${publication.id}`}
          >
            <View className="w-9 h-9 rounded-full bg-error-light items-center justify-center">
              <Ionicons name="heart" size={18} color="#E84234" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

FavoriteCard.displayName = "FavoriteCard";

export default FavoriteCard;
