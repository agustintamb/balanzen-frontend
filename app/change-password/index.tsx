import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Controller } from "react-hook-form";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Input from "@/components/ui/Input";
import { useChangePasswordScreen } from "./useChangePasswordScreen";

const ChangePassword = () => {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isPending,
    handleBack,
    handleSave,
  } = useChangePasswordScreen();

  const content = (
    <>
      <ScrollView
        style={{ flex: 1 }}
        className="bg-surface"
        contentContainerClassName="px-4 pt-10 pb-4 gap-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-4">
          <Icon
            name="lock"
            size={32}
            variant="soft"
            color="primary"
            containerSize={80}
          />
        </View>

        <Controller
          control={control}
          name="current_password"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <Input
              label="Contraseña actual"
              value={value}
              onChangeText={onChange}
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
              type="password"
              leftIcon={<Icon name="lock" size={18} color="muted" />}
              error={error?.message}
              testID="input-confirm-password"
            />
          )}
        />
      </ScrollView>

      <SafeAreaView edges={["bottom", "left", "right"]} className="bg-surface">
        <View className="px-4 pt-3 pb-2 gap-4">
          <Button
            onPress={handleSave}
            disabled={!canSave}
            loading={isSubmitting}
            testID="btn-save-password"
          >
            Guardar contraseña
          </Button>
          <Text className="text-center font-sans text-[11px] text-gray-400 px-6">
            Usá al menos 8 caracteres con letras, números y símbolos.
          </Text>
        </View>
      </SafeAreaView>
    </>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        {/* Header */}
        <View className="flex-row items-center px-2 pt-2 pb-1">
          <TouchableOpacity
            onPress={handleBack}
            className="p-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            testID="btn-back"
          >
            <Icon name="arrow-left" size={24} color="primary-dark" />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-sans-semibold text-lg text-primary-dark mr-10">
            Cambiar contraseña
          </Text>
        </View>
      </SafeAreaView>

      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>{content}</View>
      )}
    </>
  );
};

export default ChangePassword;
