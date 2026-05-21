import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const SPLASH_DURATION_MS = 1000;
const FADE_DURATION_MS = 200;

export function useSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  return { visible, opacity };
}
