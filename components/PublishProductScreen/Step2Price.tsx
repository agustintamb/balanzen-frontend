import { Text, View } from "react-native";
import { Controller, type Control } from "react-hook-form";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import type { PublishFormValues } from "@/lib/commerce/publish/types";
import DonationCard from "./DonationCard";

interface Step2PriceProps {
  control: Control<PublishFormValues>;
  isDonation: boolean;
  onToggleDonation: (value: boolean) => void;
  onChangeFinalPrice: (text: string) => void;
  onChangeOriginalPrice: (text: string) => void;
}

const Step2Price = ({
  control,
  isDonation,
  onToggleDonation,
  onChangeFinalPrice,
  onChangeOriginalPrice,
}: Step2PriceProps) => (
  <View className="flex-1">
    <View className="gap-4">
      <DonationCard value={isDonation} onChange={onToggleDonation} />

      {!isDonation && (
        <>
          <Controller
            control={control}
            name="final_price"
            render={({ field: { value }, fieldState: { error } }) => (
              <Input
                value={value}
                onChangeText={onChangeFinalPrice}
                placeholder="Precio de venta ($)"
                type="number"
                hint="Precio con descuento aplicado"
                error={error?.message}
                testID="input-final-price"
              />
            )}
          />

          <Controller
            control={control}
            name="original_price"
            render={({ field: { value }, fieldState: { error } }) => (
              <Input
                value={value}
                onChangeText={onChangeOriginalPrice}
                placeholder="Precio original ($)"
                type="number"
                hint="Precio sin descuento (referencia)"
                error={error?.message}
                testID="input-original-price"
              />
            )}
          />
        </>
      )}
    </View>

    {/* Empuja el aviso al pie de la sección, cerca del CTA */}
    <View className="flex-1" />

    <View className="flex-row gap-2 rounded-2xl bg-warning-light p-4">
      <Icon name="info" size={18} color="warning" />
      <Text className="flex-1 font-sans text-sm text-warning">
        Tu publicación será visible para usuarios cercanos. Podés editarla o
        eliminarla desde tu panel en cualquier momento.
      </Text>
    </View>
  </View>
);

export default Step2Price;
