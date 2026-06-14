import { useEffect, useRef } from "react";
import { Animated, Modal, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "@/components/ui/Icon";

interface PublishSuccessProps {
  visible: boolean;
  onDone: () => void;
}

const SUCCESS_DURATION_MS = 2000;

const PublishSuccess = ({ visible, onDone }: PublishSuccessProps) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 9,
      stiffness: 140,
    }).start();
    const timer = setTimeout(onDone, SUCCESS_DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onDone}
    >
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon name="check-circle" size={96} color="primary" />
        </Animated.View>
        <Text className="mt-8 font-sans-bold text-2xl text-primary-dark">
          ¡Publicación creada!
        </Text>
        <Text className="mt-2 text-center font-sans text-base text-gray-500">
          Tu publicación ya se encuentra visible
        </Text>
      </View>
    </Modal>
  );
};

export default PublishSuccess;
