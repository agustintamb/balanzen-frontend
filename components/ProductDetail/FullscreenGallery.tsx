import { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Icon from "@/components/ui/Icon";
import { buildDetailImageUrl } from "@/utils/cloudinary";

interface FullscreenGalleryProps {
  photos: string[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

const FullscreenGallery = ({
  photos,
  initialIndex,
  visible,
  onClose,
}: FullscreenGalleryProps) => {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar style="light" />
      <View className="flex-1 bg-black">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: initialIndex * width, y: 0 }}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
          testID="gallery-scroll"
        >
          {photos.map((photo, i) => (
            <View
              key={`${photo}-${i}`}
              style={{ width, height }}
              className="items-center justify-center"
            >
              <Image
                source={{ uri: buildDetailImageUrl(photo) }}
                style={{ width, height: height * 0.8 }}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>

        <SafeAreaView
          edges={["top"]}
          className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4"
        >
          <View className="rounded-full bg-black/50 px-3 py-1">
            <Text className="font-sans-medium text-sm text-white">
              {index + 1}/{photos.length}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/50"
            testID="btn-close-gallery"
          >
            <Icon name="x" size={22} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default FullscreenGallery;
