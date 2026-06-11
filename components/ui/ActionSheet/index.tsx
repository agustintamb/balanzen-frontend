import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/ui/Button";
import Icon, { type IconColor, type IconName } from "@/components/ui/Icon";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface ActionSheetProps {
  visible: boolean;
  // Ícono superior (opcional)
  iconName?: IconName;
  iconColor?: IconColor;
  // Contenido
  title: string;
  message?: string;
  // Botón de confirmación
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  loading?: boolean;
  // Botón de cancelar
  cancelLabel?: string;
  onCancel: () => void;
}

const ActionSheet = ({
  visible,
  iconName,
  iconColor = "error",
  title,
  message,
  confirmLabel,
  confirmVariant = "danger",
  onConfirm,
  loading = false,
  cancelLabel = "Volver",
  onCancel,
}: ActionSheetProps) => {
  const { bottom } = useSafeAreaInsets();
  const [shouldRender, setShouldRender] = useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 220,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: bottom + 20, transform: [{ translateY }] },
        ]}
      >
        {/* Pill indicator */}
        <View style={styles.pill} />

        {/* Ícono (opcional) */}
        {iconName && (
          <View style={styles.iconWrapper}>
            <Icon
              name={iconName}
              variant="soft"
              color={iconColor}
              size={28}
              containerSize={72}
            />
          </View>
        )}

        {/* Título */}
        <Text style={styles.title}>{title}</Text>

        {/* Mensaje (opcional) */}
        {!!message && <Text style={styles.message}>{message}</Text>}

        {/* Botones */}
        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={styles.cancelButton}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Button
              variant={confirmVariant}
              onPress={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default ActionSheet;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 12,
  },
  pill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 24,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#27500A",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  cancelLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#374151",
  },
});
