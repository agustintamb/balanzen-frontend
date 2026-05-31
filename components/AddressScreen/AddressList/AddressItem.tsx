import { Text, TouchableOpacity, View } from "react-native";
import type { Address } from "@/api/addresses/addresses.types";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

const buildAddressSubtitle = (address: Address): string =>
  [address.city, address.province].filter(Boolean).join(", ");

interface AddressItemProps {
  address: Address;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const AddressItem = ({
  address,
  isSelected,
  onPress,
  onLongPress,
}: AddressItemProps) => {
  const subtitle = buildAddressSubtitle(address);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.75}
      className={cn(
        "flex-row items-start gap-3 px-4 py-4 rounded-2xl border-2",
        isSelected
          ? "border-primary bg-primary-light"
          : "border-gray-200 bg-white",
      )}
    >
      <View style={{ paddingTop: 2 }}>
        <Icon name="map-pin" size={20} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="font-sans-medium text-base text-primary-dark">
          {address.formatted_address}
        </Text>
        {subtitle.length > 0 && (
          <Text className="font-sans text-sm text-gray-500">{subtitle}</Text>
        )}
      </View>

      <View style={{ paddingTop: 2, opacity: isSelected ? 1 : 0 }}>
        <Icon name="check-circle" size={22} />
      </View>
    </TouchableOpacity>
  );
};

export default AddressItem;
