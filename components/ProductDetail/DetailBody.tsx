import { Text, View } from "react-native";
import type { Publication } from "@/api/publications/publications.types";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";
import { formatPrice, getExpiryWarning, getSavings } from "./utils";

interface DetailBodyProps {
  publication: Publication;
}

const EXPIRY_COLOR = {
  urgent: { text: "text-error", icon: "error" },
  warning: { text: "text-warning", icon: "warning" },
  info: { text: "text-gray-500", icon: "muted" },
} as const;

const DetailBody = ({ publication }: DetailBodyProps) => {
  const {
    title,
    description,
    final_price,
    original_price,
    is_donation,
    discount_pct,
    category,
    expiry_date,
  } = publication;
  const hasDiscount = !is_donation && discount_pct > 0;
  const savings = getSavings(publication);
  const expiry =
    publication.status === "ACTIVE" ? getExpiryWarning(expiry_date) : null;

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <View className="flex-row items-start gap-3">
          <Text className="flex-1 font-sans-bold text-2xl text-black">
            {title}
          </Text>
          <View className="mt-1 rounded-full bg-gray-100 px-3 py-1">
            <Text className="font-sans-medium text-xs text-gray-500">
              {category.name}
            </Text>
          </View>
        </View>
        {!!description && (
          <Text className="font-sans text-base text-gray-500">
            {description}
          </Text>
        )}
      </View>

      <View className="gap-2">
        <View className="flex-row flex-wrap items-baseline gap-2">
          <Text className="font-sans-bold text-3xl text-primary">
            {is_donation ? "Gratis" : formatPrice(final_price)}
          </Text>
          {original_price > 0 && (hasDiscount || is_donation) && (
            <Text className="font-sans text-lg text-gray-400 line-through">
              {formatPrice(original_price)}
            </Text>
          )}
          {savings > 0 && (
            <Text className="font-sans-semibold text-base text-primary">
              Ahorrás {formatPrice(savings)}
            </Text>
          )}
        </View>

        {expiry && (
          <View className="flex-row items-center gap-1.5">
            <Icon
              name="clock"
              size={14}
              color={EXPIRY_COLOR[expiry.level].icon}
            />
            <Text
              className={cn(
                "font-sans-medium text-sm",
                EXPIRY_COLOR[expiry.level].text,
              )}
            >
              {expiry.label}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default DetailBody;
