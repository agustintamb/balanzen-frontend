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
    <ScrollView
      style={{ flex: 1 }}
      className="bg-surface"
      contentContainerClassName="px-4 pt-8 pb-6 gap-4"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center mb-2">
        <Icon
          name="lock"
          size={28}
          variant="soft"
          color="primary"
          containerSize={64}
        />
      </View>

      <Input
        label="Contraseña actual"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        type="password"
        leftIcon={<Icon name="lock" size={18} color="muted" />}
        testID="input-current-password"
      />

      <Input
        label="Nueva contraseña"
        value={newPassword}
        onChangeText={setNewPassword}
        type="password"
        leftIcon={<Icon name="lock" size={18} color="muted" />}
        testID="input-new-password"
      />

      <Input
        label="Confirmar nueva contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        type="password"
        leftIcon={<Icon name="lock" size={18} color="muted" />}
        testID="input-confirm-password"
      />

      <Button
        onPress={handleSave}
        loading={isPending}
        className="mt-2"
        testID="btn-save-password"
      >
        Guardar contraseña
      </Button>

      <Text className="text-center font-sans text-xs text-gray-400 mt-1">
        Usá al menos 8 caracteres con letras, números y símbolos.
      </Text>
    </ScrollView>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <View className="flex-row items-center px-2 pt-2 pb-1">
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
