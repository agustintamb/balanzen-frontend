import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import Icon from "@/components/ui/Icon";
import { MAX_PHOTOS } from "@/lib/commerce/publish/constants";
import type { PhotoItem } from "@/lib/commerce/publish/types";
import { cn } from "@/utils/cn";

interface PhotoUploaderProps {
  photos: PhotoItem[];
  isUploading: boolean;
  onPick: () => void;
  onRemove: (id: string) => void;
}

const PhotoUploader = ({
  photos,
  isUploading,
  onPick,
  onRemove,
}: PhotoUploaderProps) => {
  const reachedLimit = photos.length >= MAX_PHOTOS;
  const disabled = reachedLimit || isUploading;

  let subtitle = `Máximo ${MAX_PHOTOS} imágenes · JPG, PNG`;
  if (isUploading) subtitle = "Subiendo imagen…";
  else if (reachedLimit) subtitle = `Alcanzaste el máximo de ${MAX_PHOTOS}`;

  return (
    <View className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-10">
      <TouchableOpacity
        onPress={onPick}
        disabled={disabled}
        activeOpacity={0.7}
        className={cn("items-center", disabled && "opacity-50")}
        testID="photo-add"
      >
        {isUploading ? (
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-light">
            <ActivityIndicator size="large" color="#639922" />
          </View>
        ) : (
          <Icon
            name="camera"
            variant="soft"
            color="primary"
            size={36}
            containerSize={96}
          />
        )}
        <Text className="mt-4 font-sans-semibold text-lg text-primary-dark">
          Agregar fotos
        </Text>
        <Text className="mt-1 font-sans text-sm text-gray-400">{subtitle}</Text>
      </TouchableOpacity>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingTop: 20 }}
        >
          {photos.map((photo) => (
            <View key={photo.id} className="relative">
              <Image
                source={{ uri: photo.uri }}
                style={{ width: 80, height: 80, borderRadius: 12 }}
                contentFit="cover"
              />
              {photo.status === "uploading" && (
                <View className="absolute inset-0 items-center justify-center rounded-xl bg-black/35">
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
              <TouchableOpacity
                onPress={() => onRemove(photo.id)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                className="absolute -right-1.5 -top-1.5 h-6 w-6 items-center justify-center rounded-full bg-primary-dark"
                testID={`photo-remove-${photo.id}`}
              >
                <Icon name="x" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default PhotoUploader;
