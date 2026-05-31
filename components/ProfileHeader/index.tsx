import { Image, Text, View } from "react-native";
import Icon from "@/components/ui/Icon";

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  initials: string;
  photoUrl?: string | null;
  addressShort?: string;
  testID?: string;
}

const ProfileHeader = ({
  displayName,
  email,
  initials,
  photoUrl,
  addressShort,
  testID,
}: ProfileHeaderProps) => (
  <View className="flex-row items-center gap-4 px-6 pt-8 pb-10" testID={testID}>
    {photoUrl ? (
      <Image
        source={{ uri: photoUrl }}
        className="w-24 h-24 rounded-full"
        testID="profile-avatar-image"
      />
    ) : (
      <View
        className="w-24 h-24 rounded-full bg-primary-light items-center justify-center"
        testID="profile-avatar-initials"
      >
        <Text className="font-sans-bold text-3xl text-primary-dark">
          {initials}
        </Text>
      </View>
    )}
    <View className="flex-1">
      <Text
        className="font-sans-bold text-xl text-primary-dark"
        numberOfLines={1}
      >
        {displayName}
      </Text>
      <Text
        className="font-sans text-sm text-gray-500 mt-0.5"
        numberOfLines={1}
      >
        {email}
      </Text>
      {addressShort !== undefined && addressShort.length > 0 && (
        <View className="flex-row items-center gap-1 mt-1.5">
          <Icon name="map-pin" size={12} color="neutral" />
          <Text className="font-sans text-sm text-gray-500" numberOfLines={1}>
            {addressShort}
          </Text>
        </View>
      )}
    </View>
  </View>
);

export default ProfileHeader;
