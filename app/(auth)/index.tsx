import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
    handleRoleContinue,
    handlePersonalContinue,
    handleGoToLogin,
    handleGoToRegister,
  } = useAuthScreen();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F1EFE8" }}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default AuthScreen;
