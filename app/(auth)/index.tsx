import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LoginSection from "./components/LoginSection";
import RegisterCommerceSection from "./components/RegisterCommerceSection";
import RegisterPersonalSection from "./components/RegisterPersonalSection";
import RegisterRoleSection from "./components/RegisterRoleSection";
import { useAuthScreen } from "./useAuthScreen";

const AuthScreen = () => {
  const {
    mode,
    selectedRole,
    androidKeyboardPad,
    handleRoleContinue,
    handlePersonalContinue,
    handleGoToLogin,
    handleGoToRegister,
  } = useAuthScreen();

  const sections = (
    <>
      {mode === "login" && (
        <LoginSection onSwitchToRegister={handleGoToRegister} />
      )}
      {mode === "register-role" && (
        <RegisterRoleSection
          onContinue={handleRoleContinue}
          onSwitchToLogin={handleGoToLogin}
        />
      )}
      {mode === "register-personal" && selectedRole && (
        <RegisterPersonalSection
          role={selectedRole}
          onComercioComplete={handlePersonalContinue}
        />
      )}
      {mode === "register-commerce" && <RegisterCommerceSection />}
    </>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F1EFE8" }}>
        {Platform.OS === "ios" ? (
          <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            {sections}
          </KeyboardAvoidingView>
        ) : (
          <View style={{ flex: 1, paddingBottom: androidKeyboardPad }}>
            {sections}
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default AuthScreen;
