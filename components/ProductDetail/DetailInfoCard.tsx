import { Text, View } from "react-native";
import type { InfoItem } from "./utils";

interface DetailInfoCardProps {
  items: InfoItem[];
}

const InfoRow = ({ item, last }: { item: InfoItem; last: boolean }) => (
  <View className={last ? "py-3.5" : "border-b border-surface-dark py-3.5"}>
    {item.block ? (
      <View className="gap-1">
        <Text className="font-sans text-sm text-gray-500">{item.label}</Text>
        <Text className="font-sans-medium text-sm text-black">
          {item.value}
        </Text>
      </View>
    ) : (
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-sans text-sm text-gray-500">{item.label}</Text>
        <Text className="flex-1 text-right font-sans-medium text-sm text-black">
          {item.value}
        </Text>
      </View>
    )}
  </View>
);

/** Card de datos (comercio o consumidor según el contexto del detalle). */
const DetailInfoCard = ({ items }: DetailInfoCardProps) => {
  if (items.length === 0) return null;

  return (
    <View className="rounded-2xl border border-surface-dark bg-white px-4 py-1">
      {items.map((item, i) => (
        <InfoRow key={item.label} item={item} last={i === items.length - 1} />
      ))}
    </View>
  );
};

export default DetailInfoCard;
