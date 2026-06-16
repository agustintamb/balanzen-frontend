import { Image, Text, TouchableOpacity, View } from "react-native";
import type { Order } from "@/api/orders/orders.types";
import Chip from "@/components/ui/Chip";
import Icon from "@/components/ui/Icon";
import { buildCardImageUrl } from "@/utils/cloudinary";
import {
  formatPrice,
  getOrderDateLabel,
  ORDER_STATUS_CHIP_VARIANT,
  ORDER_STATUS_LABEL,
} from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderCardProps {
  order: Order;
  onPress?: (id: string) => void;
  /** Show a notification dot when there are unread chat messages. */
  hasUnreadMessages?: boolean;
  /**
   * "consumer" shows the commerce name (default).
   * "commerce" shows the consumer's full name.
   */
  perspective?: "consumer" | "commerce";
}

// ─── Component ────────────────────────────────────────────────────────────────

const OrderCard = ({
  order,
  onPress,
  hasUnreadMessages = false,
  perspective = "consumer",
}: OrderCardProps) => {
  const {
    id,
    publication,
    consumer,
    commerce,
    status,
    created_at,
    updated_at,
  } = order;

  const imageUrl = publication.photos[0]
    ? buildCardImageUrl(publication.photos[0])
    : null;

  const secondaryLabel =
    perspective === "consumer"
      ? commerce.business_name
      : `${consumer.first_name} ${consumer.last_name}`;

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
            <View className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-error border-2 border-white" />
          )}
        </View>

        <View className="flex-1 gap-0.5">
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className="font-sans-semibold text-sm text-primary-dark flex-1"
              numberOfLines={2}
            >
              {publication.title}
            </Text>
            <Chip
              label={ORDER_STATUS_LABEL[status]}
              variant={ORDER_STATUS_CHIP_VARIANT[status]}
              size="sm"
            />
          </View>

          <Text className="font-sans text-xs text-gray-400" numberOfLines={1}>
            {secondaryLabel}
          </Text>

          <View className="flex-row items-baseline justify-between mt-1">
            <Text className="font-sans-bold text-base text-primary-dark">
              {formatPrice(publication.final_price)}
            </Text>
            <Text className="font-sans text-xs text-gray-400">
              {getOrderDateLabel(status, created_at, updated_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;
