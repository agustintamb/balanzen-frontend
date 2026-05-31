import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "@/api/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { buildDetailImageUrl, buildProfilePhotoUrl } from "@/utils/cloudinary";

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const useProfileScreen = () => {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();

  const displayName = user ? `${user.first_name} ${user.last_name}` : "";
  const initials = user ? getInitials(user.first_name, user.last_name) : "";
  const photoUrl = user?.photo_url
    ? buildProfilePhotoUrl(user.photo_url)
    : null;
  const photoFullUrl = user?.photo_url
    ? buildDetailImageUrl(user.photo_url)
    : null;
  const addressShort = user?.selected_address
    ? `${user.selected_address.street} ${user.selected_address.number}, ${user.selected_address.city}`
    : undefined;
  const unreadCount = notifications?.unread_count ?? 0;

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleAddresses = () => {
    router.push("/(onboarding)/address");
  };

  const handleChangePassword = () => {
    console.error("Navigate to change password — not implemented");
  };

  const handleFavorites = () => {
    console.error("Navigate to favorites — not implemented");
  };

  const handleNotifications = () => {
    console.error("Navigate to notifications — not implemented");
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    setAuthToken(null);
    clear();
    router.replace("/(auth)" as never);
  };

  return {
    displayName,
    email: user?.email ?? "",
    initials,
    photoUrl,
    photoFullUrl,
    addressShort,
    unreadCount,
    handleEditProfile,
    handleAddresses,
    handleChangePassword,
    handleFavorites,
    handleNotifications,
    handleLogout,
  };
};

// Expo Router requires a default export in app/ — this is a hook, not a screen
export default function _() {
  return null;
}
