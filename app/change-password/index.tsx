import { Text, TouchableOpacity, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAvoidingView,
} from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Controller } from "react-hook-form";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { useChangePasswordScreen } from "./useChangePasswordScreen";

const ChangePassword = () => {
  const { control, isValid, isSubmitting, handleBack, handleSave } =
    useChangePasswordScreen();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pt-6 pb-4">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <Icon name="chevron-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark">
            Cambiar contraseña
          </Text>
          <View className="w-10" />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingTop: 24, gap: 16 }}
          className="bg-surface"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={16}
        >
          <Controller
            control={control}
            name="current_password"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Contraseña actual"
                value={value}
                onChangeText={onChange}
                placeholder="Tu contraseña actual"
                type="password"
                leftIcon={<Icon name="lock" size={18} color="muted" />}
                error={error?.message}
                testID="input-current-password"
              />
            )}
          />

          <Controller
            control={control}
            name="new_password"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Nueva contraseña"
                value={value}
                onChangeText={onChange}
                placeholder="Mínimo 8 caracteres"
                type="password"
                leftIcon={<Icon name="lock" size={18} color="muted" />}
                error={error?.message}
                testID="input-new-password"
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Confirmar nueva contraseña"
                value={value}
                onChangeText={onChange}
                placeholder="Repetí la nueva contraseña"
                type="password"
                leftIcon={<Icon name="lock" size={18} color="muted" />}
                error={error?.message}
                testID="input-confirm-password"
              />
            )}
          />

          <View className="flex-row items-start gap-2 px-1">
            <Icon name="info" size={13} color="muted" />
            <Text className="flex-1 font-sans text-xs text-gray-400 leading-4">
              Usá al menos 8 caracteres con letras, números y símbolos.
            </Text>
          </View>
        </KeyboardAwareScrollView>

        <SafeAreaView edges={["bottom", "left", "right"]} className="bg-surface">
          <View className="px-4 pt-3 pb-2">
            <Button
              onPress={handleSave}
              disabled={!isValid}
              loading={isSubmitting}
              testID="btn-save-password"
            >
              Guardar contraseña
            </Button>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
};

export default ChangePassword;
