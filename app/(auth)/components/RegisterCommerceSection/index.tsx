import { ScrollView, Text, View } from "react-native";
import Banner from "@/components/Banner";
import Button from "@/components/ui/Button";
import CommerceForm from "../CommerceForm";
import { useRegisterCommerceSection } from "./useRegisterCommerceSection";

const RegisterCommerceSection = () => {
  const { control, onSubmit, isValid, isPending } =
    useRegisterCommerceSection();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Banner />
        <View style={{ padding: 20, paddingTop: 24, gap: 24 }}>
          <View style={{ gap: 4 }}>
            <Text className="font-sans-bold text-xl text-primary-dark">
              Datos del comercio
            </Text>
            <Text className="font-sans text-sm text-gray-500">
              Información de tu negocio para que los clientes te encuentren
            </Text>
          </View>

          <CommerceForm control={control} />
        </View>
      </ScrollView>

      <View style={{ padding: 20, paddingTop: 12 }}>
        <Button disabled={!isValid} loading={isPending} onPress={onSubmit}>
          Crear cuenta
        </Button>
      </View>
    </View>
  );
};

export default RegisterCommerceSection;
