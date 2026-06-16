import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@/components/ui/Icon";
import { buildDetailImageUrl } from "@/utils/cloudinary";
import { cn } from "@/utils/cn";
import FullscreenGallery from "./FullscreenGallery";
import { useDetailImageCarousel } from "./useDetailImageCarousel";

const CAROUSEL_HEIGHT = 300;

interface DetailImageCarouselProps {
  photos: string[];
  onBack: () => void;
  rightActions?: React.ReactNode;
}

const DetailImageCarousel = ({
  photos,
  onBack,
  rightActions,
}: DetailImageCarouselProps) => {
  const {
    width,
    activeIndex,
    viewerIndex,
    handleScrollEnd,
    openViewer,
    closeViewer,
  } = useDetailImageCarousel();
  const hasPhotos = photos.length > 0;

  return (
    <View style={{ height: CAROUSEL_HEIGHT }} className="bg-surface-dark">
      {hasPhotos ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {photos.map((photo, i) => (
            <TouchableOpacity
              key={`${photo}-${i}`}
              activeOpacity={0.95}
              onPress={() => openViewer(i)}
              testID={`carousel-image-${i}`}
            >
              <Image
                source={{ uri: buildDetailImageUrl(photo) }}
                style={{ width, height: CAROUSEL_HEIGHT }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Icon name="image" size={48} color="muted" />
        </View>
      )}

      {photos.length > 1 && (
        <View className="absolute bottom-14 w-full flex-row items-center justify-center gap-1.5">
          {photos.map((photo, i) => (
            <View
              key={`dot-${photo}-${i}`}
              className={cn(
                "h-1.5 rounded-full",
                i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/60",
              )}
            />
          ))}
        </View>
      )}

      <SafeAreaView
        edges={["top"]}
        className="absolute left-0 right-0 top-0 flex-row items-center justify-between px-4 pt-2"
      >
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="h-10 w-10 items-center justify-center rounded-full bg-white"
          testID="btn-back"
        >
          <Icon name="arrow-left" size={20} color="primary-dark" />
        </TouchableOpacity>
        {rightActions && (
          <View className="flex-row items-center gap-2">{rightActions}</View>
        )}
      </SafeAreaView>

      {viewerIndex !== null && (
        <FullscreenGallery
          photos={photos}
          initialIndex={viewerIndex}
          visible={viewerIndex !== null}
          onClose={closeViewer}
        />
      )}
    </View>
  );
};

export default DetailImageCarousel;
