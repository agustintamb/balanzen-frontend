import { ScrollView, Text, View } from "react-native";
import { Controller } from "react-hook-form";
import Banner from "@/components/Banner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLoginSection } from "./useLoginSection";

interface LoginSectionProps {
  onSwitchToRegister: () => void;
}

const LoginSection = ({ onSwitchToRegister }: LoginSectionProps) => {
  const { control, onSubmit, isValid, isPending } = useLoginSection();

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
              Iniciá sesión
            </Text>
            <Text className="font-sans text-sm text-gray-500">
              Accedé a tu cuenta de BalanZen
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="tu@email.com"
                  type="email"
                  error={error?.message}
                  returnKeyType="next"
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="Contraseña"
                  type="password"
                  error={error?.message}
                  returnKeyType="done"
                  onSubmitEditing={onSubmit}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 20, paddingTop: 12, gap: 12 }}>
        <Button
          disabled={!isValid}
          loading={isPending}
          onPress={onSubmit}
          rightIconName="arrow-forward"
        >
          Ingresar
        </Button>
        <View className="flex-row items-center justify-center">
          <Text className="font-sans text-sm text-gray-500">
            ¿Aún no tenés cuenta?{" "}
          </Text>
          <Button variant="textLink" size="sm" onPress={onSwitchToRegister}>
            Registrarse
          </Button>
        </View>
      </View>
    </View>
  );
};

export default LoginSection;
