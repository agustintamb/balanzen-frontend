import { ScrollView, Text, View } from "react-native";
import type { UserRole } from "@/api/users/users.types";
import Banner from "@/components/Banner";
import Button from "@/components/ui/Button";
import PersonalForm from "../PersonalForm";
import { useRegisterPersonalSection } from "./useRegisterPersonalSection";

interface RegisterPersonalSectionProps {
  role: UserRole;
  onComercioComplete: () => void;
}

const RegisterPersonalSection = ({
  role,
  onComercioComplete,
}: RegisterPersonalSectionProps) => {
  const { control, trigger, onSubmit, isValid, isPending, isConsumidor } =
    useRegisterPersonalSection(role, onComercioComplete);

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
              Tus datos personales
            </Text>
            <Text className="font-sans text-sm text-gray-500">
              Completá tu información básica para comenzar
            </Text>
          </View>

          <PersonalForm control={control} trigger={trigger} />
        </View>
      </ScrollView>

      <View style={{ padding: 20, paddingTop: 12 }}>
        <Button
          disabled={!isValid}
          loading={isPending}
          onPress={onSubmit}
          rightIconName={isConsumidor ? undefined : "arrow-forward"}
        >
          {isConsumidor ? "Crear cuenta" : "Continuar"}
        </Button>
      </View>
    </View>
  );
};

export default RegisterPersonalSection;
