import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/UserAvatar";

interface ProfileHeaderProps {
  displayName: string;
  email: string;
  initials: string;
  photoUrl?: string | null;
  photoFullUrl?: string | null;
  addressShort?: string;
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ProfileHeader = ({
  displayName,
  email,
  initials,
  photoUrl,
  photoFullUrl,
  addressShort,
  testID,
}: ProfileHeaderProps) => {
  const [viewerVisible, setViewerVisible] = useState(false);

  return (
    <>
      <View
        className="flex-row items-center gap-4 px-6 pt-8 pb-10"
        testID={testID}
      >
        <UserAvatar
          photoUrl={photoUrl}
          initials={initials}
          size={112}
          onPress={photoFullUrl ? () => setViewerVisible(true) : undefined}
          testID="profile-avatar"
        />
        <View className="flex-1">
          <Text className="font-sans-bold text-xl text-primary-dark">
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
              <Text
                className="font-sans text-sm text-gray-500"
                numberOfLines={1}
              >
                {addressShort}
              </Text>
            </View>
          )}
        </View>
      </View>

      {photoFullUrl !== undefined && photoFullUrl !== null && (
        <Modal
          visible={viewerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setViewerVisible(false)}
        >
          <StatusBar style="light" />
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.92)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setViewerVisible(false)}
            activeOpacity={1}
            testID="photo-viewer-backdrop"
          >
            <Image
              source={{ uri: photoFullUrl }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="contain"
              testID="photo-viewer-image"
            />
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

export default ProfileHeader;
