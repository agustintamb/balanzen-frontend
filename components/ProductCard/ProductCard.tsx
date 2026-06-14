import { Image, Text, TouchableOpacity, View } from "react-native";
import type { Publication } from "@/api/publications/publications.types";
import Chip from "@/components/ui/Chip";
import Icon from "@/components/ui/Icon";
import { buildCardImageUrl } from "@/utils/cloudinary";
import {
  formatCreatedAt,
  formatPrice,
  getExpiryWarning,
  STATUS_CHIP_VARIANT,
  STATUS_LABEL,
} from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  publication: Publication;
  onPress?: (id: string) => void;
  /** Show the status chip. Defaults to true. */
  showStatus?: boolean;
  /** Show the commerce name. For consumer views. Defaults to false. */
  showCommerce?: boolean;
  /** Show the commerce address at the bottom. For consumer views. Defaults to false. */
  showAddress?: boolean;
  /** Show the created_at date in the bottom-right. Defaults to true. */
  showDate?: boolean;
  /** Show expiry warning text (and card tint) when the publication is about to expire. */
  showExpiryWarning?: boolean;
  /** Show a notification dot when there are unread chat messages. */
  hasUnreadMessages?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProductCard = ({
  publication,
  onPress,
  showStatus = true,
  showCommerce = false,
  showAddress = false,
  showDate = true,
  showExpiryWarning = false,
  hasUnreadMessages = false,
}: ProductCardProps) => {
  const {
    id,
    title,
    final_price,
    original_price,
    discount_pct,
    is_donation,
    photos,
    status,
    commerce,
    created_at,
    expiry_date,
  } = publication;

  const imageUrl = photos[0] ? buildCardImageUrl(photos[0]) : null;
  const hasDiscount = !is_donation && discount_pct > 0;
  const expiryWarning = showExpiryWarning
    ? getExpiryWarning(expiry_date)
    : null;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(id)}
      activeOpacity={0.85}
      className="bg-white rounded-2xl mx-4 px-4 py-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="flex-row gap-3">
        <View>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              className="w-16 h-16 rounded-xl bg-surface-dark"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-surface-dark items-center justify-center">
              <Icon name="image" size={22} color="muted" />
            </View>
          )}
          {hasUnreadMessages && (
            <View className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white" />
          )}
        </View>

        <View className="flex-1 gap-0.5">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className="font-sans-semibold text-sm text-primary-dark flex-1"
              numberOfLines={2}
            >
              {title}
            </Text>
            {showStatus && (
              <Chip
                label={STATUS_LABEL[status]}
                variant={STATUS_CHIP_VARIANT[status]}
                size="sm"
                showDot={status === "ACTIVE"}
              />
            )}
          </View>

          {showCommerce && (
            <Text className="font-sans text-xs text-gray-400" numberOfLines={1}>
              {commerce.business_name}
            </Text>
          )}

          <View className="flex-row items-baseline justify-between mt-1">
            {is_donation ? (
              <Text className="font-sans-bold text-base text-primary">
                Gratis
              </Text>
            ) : (
              <View className="flex-row items-baseline gap-1.5">
                <Text className="font-sans-bold text-base text-primary-dark">
                  {formatPrice(final_price)}
                </Text>
                {hasDiscount && (
                  <Text className="font-sans text-xs text-gray-400 line-through">
                    {formatPrice(original_price)}
                  </Text>
                )}
              </View>
            )}
            {showDate ? (
              <Text className="font-sans text-xs text-gray-400">
                {formatCreatedAt(created_at)}
              </Text>
            ) : expiryWarning ? (
              <Text
                className={
                  expiryWarning.level === "urgent"
                    ? "font-sans-medium text-xs text-error"
                    : expiryWarning.level === "warning"
                      ? "font-sans-medium text-xs text-warning"
                      : "font-sans text-xs text-gray-400"
                }
              >
                {expiryWarning.label}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {showAddress && (
        <View className="flex-row items-center gap-1.5 mt-2.5 pt-2.5 border-t border-surface-dark">
          <Icon name="map-pin" size={12} color="primary" />
          <Text
            className="font-sans text-xs text-gray-500 flex-1"
            numberOfLines={1}
          >
            {commerce.selected_address.formatted_address}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ProductCard;
