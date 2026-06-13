import { useEffect, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import type { Publication } from "@/api/publications/publications.types";
import Icon from "@/components/ui/Icon";
import { buildCardImageUrl } from "@/utils/cloudinary";
import { cn } from "@/utils/cn";
import { formatDistance, formatPrice, getExpiryWarning } from "./utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConsumerPublicationCardProps {
  publication: Publication;
  onPress?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ConsumerPublicationCard = ({
  publication,
  onPress,
}: ConsumerPublicationCardProps) => {
  const {
    id,
    title,
    final_price,
    original_price,
    discount_pct,
    is_donation,
    photos,
    commerce,
    expiry_date,
    distance_km,
  } = publication;

  const imageUrl = photos[0] ? buildCardImageUrl(photos[0]) : null;
  const hasDiscount = !is_donation && discount_pct > 0;
  const expiryWarning = getExpiryWarning(expiry_date);
  const showExpiryBadge = expiryWarning && expiryWarning.level !== "info";

  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!is_donation) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [is_donation, pulseAnim]);

  return (
    <View style={{ marginHorizontal: 16 }}>
      <TouchableOpacity
        onPress={() => onPress?.(id)}
        activeOpacity={0.88}
        className="bg-white rounded-2xl overflow-hidden"
        style={{ width: "100%" }}
      >
        <View className="flex-row gap-3 px-3 pt-3 pb-2.5">
          {/* Imagen — 88×88 */}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 88, height: 88, borderRadius: 10 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{ width: 88, height: 88, borderRadius: 10 }}
              className="bg-surface-dark items-center justify-center"
            >
              <Icon name="image" size={26} color="muted" />
            </View>
          )}

          {/* Contenido */}
          <View className="flex-1 gap-1 py-0.5">
            {/* Título + distancia arriba derecha */}
            <View className="flex-row items-start gap-2">
              <Text
                className="font-sans-semibold text-sm text-primary-dark flex-1"
                numberOfLines={2}
              >
                {title}
              </Text>
              {distance_km != null && (
                <View className="flex-row items-center gap-0.5 self-start mt-0.5">
                  <Icon name="map-pin" size={10} color="muted" />
                  <Text className="font-sans text-xs text-gray-400">
                    {formatDistance(distance_km)}
                  </Text>
                </View>
              )}
            </View>

            {/* Comercio */}
            <Text className="font-sans text-xs text-gray-400" numberOfLines={1}>
              {commerce.business_name}
            </Text>

            {/* Precio */}
            <View className="flex-row items-center gap-1.5 mt-0.5">
              {is_donation ? (
                <>
                  <Text className="font-sans-bold text-base text-primary">
                    Gratis
                  </Text>
                  <Text className="font-sans text-xs text-gray-400 line-through">
                    {formatPrice(original_price)}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="font-sans-bold text-base text-primary-dark">
                    {formatPrice(final_price)}
                  </Text>
                  {hasDiscount && (
                    <>
                      <Text className="font-sans text-xs text-gray-400 line-through">
                        {formatPrice(original_price)}
                      </Text>
                      <View className="bg-primary-light rounded-full px-1.5 py-0.5">
                        <Text className="font-sans-semibold text-xs text-primary-dark">
                          -{discount_pct}%
                        </Text>
                      </View>
                    </>
                  )}
                </>
              )}
            </View>

            {/* Vencimiento — al pie del contenido, alineado a la derecha */}
            {showExpiryBadge && (
              <View
                className={cn(
                  "self-end flex-row items-center gap-1 rounded-full px-2 py-0.5",
                  expiryWarning.level === "urgent"
                    ? "bg-error-light"
                    : "bg-warning-light",
                )}
              >
                <Icon
                  name="clock"
                  size={10}
                  color={expiryWarning.level === "urgent" ? "error" : "warning"}
                />
                <Text
                  className={cn(
                    "font-sans-semibold text-xs",
                    expiryWarning.level === "urgent"
                      ? "text-error"
                      : "text-warning",
                  )}
                >
                  {expiryWarning.label}
                </Text>
              </View>
            )}
            {!showExpiryBadge && expiryWarning?.level === "info" && (
              <Text className="self-end font-sans text-xs text-gray-400">
                {expiryWarning.label}
              </Text>
            )}
          </View>
        </View>
        {/* ── Dirección ─────────────────────────────────
            px-3 (no mx-3) para que el border-t abarque
            todo el ancho de la card sin desalinearse. */}
        <View className="flex-row items-center gap-1.5 px-3 pt-2 pb-2.5 border-t border-surface-dark">
          <Icon name="map-pin" size={11} color="muted" />
          <Text
            className="font-sans text-xs text-gray-400 flex-1"
            numberOfLines={1}
          >
            {commerce.selected_address.formatted_address}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Borde animado DESPUÉS de la card para quedar encima (z-order) */}
      {is_donation && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: "#639922",
            opacity: pulseAnim,
          }}
        />
      )}
    </View>
  );
};

export default ConsumerPublicationCard;
