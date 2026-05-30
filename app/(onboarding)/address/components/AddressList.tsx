import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import type { Address } from "@/api/addresses/addresses.types";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface AddressListProps {
  addresses: Address[];
  selectedId: string | null;
  isLoading: boolean;
  onPressAddress: (id: string) => void;
  onLongPressAddress: (id: string) => void;
}

const AddressItem = ({
  address,
  isSelected,
  onPress,
  onLongPress,
}: {
  address: Address;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) => (
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
    {/* Ícono alineado al inicio del texto */}
    <View style={{ paddingTop: 2 }}>
      <Icon name="location-outline" size={20} />
    </View>

    {/* Texto sin recorte */}
    <View className="flex-1 gap-0.5">
      <Text className="font-sans-medium text-base text-primary-dark">
        {address.formatted_address}
      </Text>
      {(address.city || address.province) && (
        <Text className="font-sans text-sm text-gray-500">
          {[address.city, address.province].filter(Boolean).join(", ")}
        </Text>
      )}
    </View>

    {/* Checkmark — siempre ocupa el mismo espacio para evitar reflow al seleccionar */}
    <View style={{ paddingTop: 2, opacity: isSelected ? 1 : 0 }}>
      <Icon name="checkmark-circle" size={22} />
    </View>
  </TouchableOpacity>
);

const AddressList = ({
  addresses,
  selectedId,
  isLoading,
  onPressAddress,
  onLongPressAddress,
}: AddressListProps) => {
  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color="#639922" />
      </View>
    );
  }

  if (addresses.length === 0) return null;

  return (
    <View className="gap-3">
      {addresses.map((address) => (
        <AddressItem
          key={address.id}
          address={address}
          isSelected={address.id === selectedId}
          onPress={() => onPressAddress(address.id)}
          onLongPress={() => onLongPressAddress(address.id)}
        />
      ))}
    </View>
  );
};

export default AddressList;
