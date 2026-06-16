import { useState } from "react";
import {
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

export const useDetailImageCarousel = () => {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return {
    width,
    activeIndex,
    viewerIndex,
    handleScrollEnd,
    openViewer: (index: number) => setViewerIndex(index),
    closeViewer: () => setViewerIndex(null),
  };
};
