import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useUIStore, type ToastType } from "@/stores/ui.store";

const AUTO_DISMISS_MS = 3500;

const CONFIG: Record<
  ToastType,
  {
    bg: string;
    text: string;
    iconColor: string;
    iconName: React.ComponentProps<typeof Feather>["name"];
  }
> = {
  error: {
    bg: "#FDECEA",
    text: "#C0392B",
    iconColor: "#E84234",
    iconName: "alert-circle",
  },
  success: {
    bg: "#EAF3DE",
    text: "#27500A",
    iconColor: "#639922",
    iconName: "check-circle",
  },
  warning: {
    bg: "#FAEEDA",
    text: "#9A5E0A",
    iconColor: "#BA7517",
    iconName: "alert-triangle",
  },
  info: {
    bg: "#F3F4F6",
    text: "#374151",
    iconColor: "#6B7280",
    iconName: "info",
  },
};

const Toast = () => {
  const { toast, hideToast } = useUIStore();
  const { top } = useSafeAreaInsets();

  // shouldRender stays true until the exit animation completes
  const [shouldRender, setShouldRender] = useState(false);

  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => {
    if (toast.visible) {
      clearTimer();
      setShouldRender(true);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 220,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      timer.current = setTimeout(hideToast, AUTO_DISMISS_MS);
    } else {
      clearTimer();

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }

    return clearTimer;
  }, [toast.visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) return null;

  const cfg = CONFIG[toast.type];

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { top: top + 12, transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity
        onPress={hideToast}
        activeOpacity={0.92}
        style={[styles.container, { backgroundColor: cfg.bg }]}
      >
        <Feather name={cfg.iconName} size={20} color={cfg.iconColor} />

        <Text style={[styles.message, { color: cfg.text }]} numberOfLines={3}>
          {toast.message}
        </Text>

        <TouchableOpacity
          onPress={hideToast}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="close" size={18} color={cfg.iconColor} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
  },
});
