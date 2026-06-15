import { useState } from "react";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@/components/ui/Icon";
import { buildDetailImageUrl } from "@/utils/cloudinary";
import { cn } from "@/utils/cn";
import FullscreenGallery from "./FullscreenGallery";

const CAROUSEL_HEIGHT = 300;

interface DetailImageCarouselProps {
  photos: string[];
  onBack: () => void;
  /** Acciones a la derecha del header (favorito, compartir). */
  rightActions?: React.ReactNode;
  /** Pills de estado/descuento/vencimiento superpuestas al pie de la imagen. */
  badges?: React.ReactNode;
}

/**
 * Carrusel horizontal de imágenes con header superpuesto (back + acciones) y
 * badges al pie. Tocar una imagen abre el visor a pantalla completa.
 */
const DetailImageCarousel = ({
  photos,
  onBack,
  rightActions,
  badges,
}: DetailImageCarouselProps) => {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const hasPhotos = photos.length > 0;

  return (
    <View style={{ height: CAROUSEL_HEIGHT }} className="bg-surface-dark">
      {hasPhotos ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {photos.map((photo, i) => (
            <TouchableOpacity
              key={`${photo}-${i}`}
              activeOpacity={0.95}
              onPress={() => setViewerIndex(i)}
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

      {/* Dots */}
      {photos.length > 1 && (
        <View className="absolute bottom-14 w-full flex-row items-center justify-center gap-1.5">
          {photos.map((photo, i) => (
            <View
              key={`dot-${photo}-${i}`}
              className={cn(
                "h-1.5 rounded-full",
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/60",
              )}
            />
          ))}
        </View>
      )}

      {/* Header superpuesto */}
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

      {/* Badges al pie */}
      {badges && <View className="absolute bottom-3 left-4">{badges}</View>}

      {viewerIndex !== null && (
        <FullscreenGallery
          photos={photos}
          initialIndex={viewerIndex}
          visible={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </View>
  );
};

export default DetailImageCarousel;
