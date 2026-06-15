import { Text, TouchableOpacity, View } from "react-native";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/utils/cn";

interface DetailCounterpartRowProps {
  /** Texto principal: nombre del consumidor o del comercio. */
  title: string;
  /** Texto secundario opcional (ej. "Esta publicación está disponible"). */
  subtitle?: string;
  /** Avatar: foto del usuario (o placeholder con iniciales). */
  avatarUrl?: string | null;
  initials?: string;
  /** Ícono a la izquierda cuando no hay avatar (ej. bolsa "sin reserva aún"). */
  leftIcon?: React.ComponentProps<typeof Icon>["name"];
  chatEnabled: boolean;
  onChatPress?: () => void;
}

/**
 * Fila entre la imagen y el título: muestra la contraparte (avatar + nombre) o
 * el estado de la reserva, y el botón de Chat (habilitado solo con order RESERVED).
 */
const DetailCounterpartRow = ({
  title,
  subtitle,
  avatarUrl,
  initials,
  leftIcon,
  chatEnabled,
  onChatPress,
}: DetailCounterpartRowProps) => (
  <View className="flex-row items-center gap-3 border-b border-surface-dark pb-4">
    {initials !== undefined ? (
      <UserAvatar photoUrl={avatarUrl} initials={initials} size={44} />
    ) : (
      leftIcon && (
        <Icon name={leftIcon} variant="soft" color="primary" size={20} />
      )
    )}

    <View className="flex-1">
      <Text
        className="font-sans-semibold text-base text-black"
        numberOfLines={1}
      >
        {title}
      </Text>
      {!!subtitle && (
        <Text className="font-sans text-xs text-gray-400" numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>

    <TouchableOpacity
      onPress={chatEnabled ? onChatPress : undefined}
      disabled={!chatEnabled}
      activeOpacity={0.7}
      className={cn(
        "flex-row items-center gap-1.5 rounded-full px-3 py-2",
        chatEnabled ? "bg-primary-light" : "bg-gray-100",
      )}
      testID="btn-chat"
    >
      <Icon
        name="message-circle"
        size={15}
        color={chatEnabled ? "primary" : "muted"}
      />
      <Text
        className={cn(
          "font-sans-medium text-xs",
          chatEnabled ? "text-primary" : "text-gray-400",
        )}
      >
        Chat
      </Text>
    </TouchableOpacity>
  </View>
);

export default DetailCounterpartRow;
