import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const DOT_DURATION = 350;
const DOT_STAGGER = 150;

const Dot = ({ delay }: { delay: number }) => {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: DOT_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: DOT_DURATION,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]);
    animation.start();
    return () => animation.stop();
  }, [value, delay]);

  return (
    <Animated.View
      style={{
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: "#9CA3AF",
        opacity: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        }),
        transform: [
          {
            translateY: value.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -3],
            }),
          },
        ],
      }}
    />
  );
};

/** Burbuja estilo WhatsApp con 3 puntitos animados ("escribiendo…"). */
const TypingBubble = () => (
  <View
    className="mt-2 flex-row items-center gap-1.5 self-start rounded-2xl rounded-bl-md bg-white px-4 py-3.5"
    testID="typing-bubble"
  >
    <Dot delay={0} />
    <Dot delay={DOT_STAGGER} />
    <Dot delay={DOT_STAGGER * 2} />
  </View>
);

export default TypingBubble;
