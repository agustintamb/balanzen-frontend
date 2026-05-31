import { ActivityIndicator, View } from "react-native";
import type { Address } from "@/api/addresses/addresses.types";
import AddressItem from "./AddressItem";

interface AddressListProps {
  addresses: Address[];
  selectedId: string | null;
  isLoading: boolean;
  onPressAddress: (id: string) => void;
  onLongPressAddress: (id: string) => void;
}

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
