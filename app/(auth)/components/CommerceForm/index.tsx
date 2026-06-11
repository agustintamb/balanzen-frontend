import { useRef } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Controller, type Control } from "react-hook-form";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn";

export type CommerceFormValues = {
  businessName: string;
  cuit: string;
  acceptTerms: boolean;
};

interface CommerceFormProps {
  control: Control<CommerceFormValues>;
}

const CommerceForm = ({ control }: CommerceFormProps) => {
  const cuitRef = useRef<TextInput>(null);

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="businessName"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            value={value}
            onChangeText={onChange}
            placeholder="Nombre del comercio"
            autoCapitalize="words"
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => cuitRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="cuit"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            ref={cuitRef}
            value={value}
            onChangeText={onChange}
            placeholder="CUIT"
            hint="Formato: XX-XXXXXXXX-X"
            error={error?.message}
            returnKeyType="done"
          />
        )}
      />
      <Controller
        control={control}
        name="acceptTerms"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="gap-1 mt-2">
            <TouchableOpacity
              onPress={() => onChange(!value)}
              activeOpacity={0.7}
              className="flex-row gap-3"
            >
              <View
                className={cn(
                  "w-6 h-6 rounded-full border-2 items-center justify-center mt-0.5 shrink-0",
                  value
                    ? "bg-primary border-primary"
                    : "bg-white border-gray-300",
                )}
              >
                {value && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text className="flex-1 font-sans text-sm text-gray-600 leading-5">
                Al registrarte aceptás nuestros{" "}
                <Text className="font-sans-medium text-primary-dark">
                  Términos de servicio
                </Text>{" "}
                y{" "}
                <Text className="font-sans-medium text-primary-dark">
                  Política de privacidad
                </Text>
                .
              </Text>
            </TouchableOpacity>
            {/* Error silencioso — el botón deshabilitado comunica que faltan términos */}
          </View>
        )}
      />
    </View>
  );
};

export default CommerceForm;
