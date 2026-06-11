import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useQueryClient } from "@tanstack/react-query";
import { setAuthToken } from "@/api/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import { buildDetailImageUrl, buildProfilePhotoUrl } from "@/utils/cloudinary";

const getInitials = (firstName: string, lastName: string): string =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const useProfileScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  const { data: user } = useCurrentUser();
  const { data: notifications } = useNotifications();

  let displayName = "";
  if (user?.business_name) {
    displayName = user.business_name;
  } else if (user) {
    displayName = `${user.first_name} ${user.last_name}`;
  }
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
    router.push("/change-password");
  };

  const handleNotifications = () => {
    router.push("/(commerce)/profile/notifications");
  };

  const handleMetrics = () => {
    router.push("/(commerce)/metrics" as never);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    setAuthToken(null);
    clear();
    queryClient.clear();
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
    handleNotifications,
    handleMetrics,
    handleLogout,
  };
};

// Expo Router requires a default export in app/ — this is a hook, not a screen
export default function _() {
  return null;
}
