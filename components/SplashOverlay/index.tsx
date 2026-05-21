import { Animated, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { useSplashOverlay } from "./useSplashOverlay";

export default function SplashOverlay() {
  const { visible, opacity } = useSplashOverlay();

  if (!visible) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { opacity }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={["#1A3408", "#22470C", "#2D6012", "#3A7A1C"]}
        style={styles.container}
      >
        <Image
          source={require("@/assets/images/balanzen-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <LottieView
          source={require("@/assets/lottie-animations/dots.json")}
          style={styles.lottie}
          autoPlay
          loop
        />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 192,
    height: 168,
  },
  lottie: {
    position: "absolute",
    bottom: 32,
    width: 80,
    height: 40,
    opacity: 0.1,
  },
});
