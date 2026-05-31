import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "@/components/ui/Icon";

interface UserAvatarProps {
  photoUrl?: string | null;
  initials: string;
  size?: number;
  isLoading?: boolean;
  editable?: boolean;
  onPress?: () => void;
  onEditPress?: () => void;
  testID?: string;
}

const UserAvatar = ({
  photoUrl,
  initials,
  size = 96,
  isLoading = false,
  editable = false,
  onPress,
  onEditPress,
  testID,
}: UserAvatarProps) => {
  const radius = size / 2;
  const badgeSize = Math.round(size * 0.32);

  const avatarBody = photoUrl ? (
    <Image
      source={{ uri: photoUrl }}
      style={{ width: size, height: size, borderRadius: radius }}
      testID="user-avatar-image"
    />
  ) : (
    <View
      style={{ width: size, height: size, borderRadius: radius }}
      className="bg-primary-light items-center justify-center"
      testID="user-avatar-initials"
    >
      <Text
        className="font-sans-bold text-primary-dark"
        style={{ fontSize: Math.round(size * 0.33) }}
      >
        {initials}
      </Text>
    </View>
  );

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
      }}
      testID={testID}
    >
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            overflow: "hidden",
          }}
        >
          {avatarBody}
        </TouchableOpacity>
      ) : (
        avatarBody
      )}

      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
          testID="user-avatar-loading"
        >
          <ActivityIndicator color="#FFFFFF" size="small" />
        </View>
      )}

      {editable && !isLoading && (
        <TouchableOpacity
          onPress={onEditPress}
          className="absolute bottom-0 right-0"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="user-avatar-edit-btn"
        >
          <Icon
            name="camera"
            variant="filled"
            color="primary"
            size={Math.round(badgeSize * 0.55)}
            containerSize={badgeSize}
            className="border-2 border-white"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserAvatar;
