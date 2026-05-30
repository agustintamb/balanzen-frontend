import { useRef } from "react";
import { TextInput, View } from "react-native";
import { Controller, type Control, type UseFormTrigger } from "react-hook-form";
import Input from "@/components/ui/Input";

export type PersonalFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dni: string;
};

interface PersonalFormProps {
  control: Control<PersonalFormValues>;
  trigger: UseFormTrigger<PersonalFormValues>;
}

const PersonalForm = ({ control, trigger }: PersonalFormProps) => {
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const dniRef = useRef<TextInput>(null);

  return (
    <View className="gap-3">
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            value={value}
            onChangeText={onChange}
            placeholder="Nombre"
            autoCapitalize="words"
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            ref={lastNameRef}
            value={value}
            onChangeText={onChange}
            placeholder="Apellido"
            autoCapitalize="words"
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            ref={emailRef}
            value={value}
            onChangeText={onChange}
            placeholder="Correo electrónico"
            type="email"
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            ref={passwordRef}
            value={value}
            onChangeText={(text) => {
              onChange(text);
              // Forzar re-validación del campo de confirmación cuando cambia la contraseña
              trigger("confirmPassword");
            }}
            placeholder="Contraseña"
            type="password"
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            ref={confirmPasswordRef}
            value={value}
            onChangeText={onChange}
            placeholder="Confirmar contraseña"
            type="password"
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            ref={phoneRef}
            value={value}
            onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
            placeholder="Teléfono"
            type="phone"
            error={error?.message}
            returnKeyType="next"
            onSubmitEditing={() => dniRef.current?.focus()}
          />
        )}
      />
      <Controller
        control={control}
        name="dni"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <Input
            ref={dniRef}
            value={value}
            onChangeText={(text) => onChange(text.replace(/\D/g, ""))}
            placeholder="DNI"
            type="number"
            error={error?.message}
            returnKeyType="done"
          />
        )}
      />
    </View>
  );
};

export default PersonalForm;
