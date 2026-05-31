import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import ProfileHeader from "@/components/ProfileHeader";
import MenuItem from "@/components/ui/MenuItem";
import { useProfileScreen } from "./useProfileScreen";

const ConsumerProfile = () => {
  const {
    displayName,
    email,
    initials,
    photoUrl,
    addressShort,
    unreadCount,
    handleEditProfile,
    handleAddresses,
    handleChangePassword,
    handleFavorites,
    handleNotifications,
    handleLogout,
  } = useProfileScreen();

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "left", "right"]} className="bg-white">
        <ProfileHeader
          displayName={displayName}
          email={email}
          initials={initials}
          photoUrl={photoUrl}
          addressShort={addressShort}
          testID="consumer-profile-header"
        />
      </SafeAreaView>

      <View className="flex-1 bg-surface">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pt-6 pb-4"
        >
          <View className="px-4 mb-6">
            <Text className="font-sans-semibold text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Mi Cuenta
            </Text>
            <MenuItem
              position="first"
              onPress={handleEditProfile}
              testID="btn-edit-profile"
            >
              Editar Perfil
            </MenuItem>
            <MenuItem
              position="middle"
              onPress={handleAddresses}
              testID="btn-addresses"
            >
              Mis Direcciones
            </MenuItem>
            <MenuItem
              position="last"
              onPress={handleChangePassword}
              testID="btn-change-password"
            >
              Cambiar Contraseña
            </MenuItem>
          </View>

          <View className="px-4">
            <Text className="font-sans-semibold text-xs text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Actividad
            </Text>
            <MenuItem onPress={handleFavorites} testID="btn-favorites">
              Mis Favoritos
            </MenuItem>
            <MenuItem
              onPress={handleNotifications}
              badgeCount={unreadCount}
              testID="btn-notifications"
            >
              Notificaciones
            </MenuItem>
          </View>
        </ScrollView>
      </View>

      <SafeAreaView edges={["bottom", "left", "right"]} className="bg-surface">
        <View className="px-4 pt-3 pb-2">
          <MenuItem
            variant="danger"
            leftIcon="log-out"
            onPress={handleLogout}
            className="mb-0"
            testID="btn-logout"
          >
            Cerrar sesión
          </MenuItem>
        </View>
      </SafeAreaView>
    </>
  );
};

export default ConsumerProfile;
