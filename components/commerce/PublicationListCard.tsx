import { Image, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Chip from "@/components/ui/Chip";
import type { ChipProps } from "@/components/ui/Chip";
import { buildCardImageUrl } from "@/utils/cloudinary";
import type { Publication, PublicationStatus } from "@/api/publications/publications.types";

const STATUS_LABEL: Record<PublicationStatus, string> = {
  ACTIVE: "Activa",
  RESERVED: "Reservada",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
  EXPIRED: "Vencida",
};

const STATUS_CHIP_VARIANT: Record<PublicationStatus, ChipProps["variant"]> = {
  ACTIVE: "primary",
  RESERVED: "warning",
  DELIVERED: "neutral",
  CANCELLED: "error",
  EXPIRED: "neutral",
};

const formatPrice = (price: number): string =>
  `$${price.toLocaleString("es-AR")}`;

interface PublicationListCardProps {
  publication: Publication;
  onPress?: (id: string) => void;
}

const PublicationListCard = ({
  publication,
  onPress,
}: PublicationListCardProps) => {
  const { id, title, original_price, final_price, is_donation, photos, status } =
    publication;

  const imageUrl = photos[0] ? buildCardImageUrl(photos[0]) : null;
  const hasDiscount = !is_donation && original_price > final_price;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(id)}
      activeOpacity={0.8}
      className="bg-white rounded-2xl p-3 flex-row gap-3 mx-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-20 h-20 rounded-xl bg-surface-dark"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-surface-dark items-center justify-center">
          <Feather name="image" size={24} color="#9CA3AF" />
        </View>
      )}

      <View className="flex-1 justify-between py-0.5">
        <Text
          className="font-sans-semibold text-sm text-primary-dark"
          numberOfLines={2}
        >
          {title}
        </Text>

        <Chip
          label={is_donation ? "Donación" : STATUS_LABEL[status]}
          variant={is_donation ? "warning" : STATUS_CHIP_VARIANT[status]}
          size="sm"
          showDot={!is_donation && status === "ACTIVE"}
          className="self-start"
        />

        {is_donation ? (
          <Text className="font-sans-bold text-base text-primary">Gratis</Text>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text className="font-sans-bold text-base text-primary">
              {formatPrice(final_price)}
            </Text>
            {hasDiscount && (
              <Text className="font-sans text-xs text-gray-400 line-through">
                {formatPrice(original_price)}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PublicationListCard;
