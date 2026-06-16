import { Text, TouchableOpacity, View } from "react-native";
import Icon from "@/components/ui/Icon";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/utils/cn";

interface DetailCounterpartRowProps {
  title: string;
  subtitle?: string;
  avatarUrl?: string | null;
  initials?: string;
  leftIcon?: React.ComponentProps<typeof Icon>["name"];
  chatEnabled: boolean;
  hasUnread?: boolean;
  onChatPress?: () => void;
}

const DetailCounterpartRow = ({
  title,
  subtitle,
  avatarUrl,
  initials,
  leftIcon,
  chatEnabled,
  hasUnread = false,
  onChatPress,
}: DetailCounterpartRowProps) => (
  <View className="flex-row items-center gap-3 border-b border-surface-dark pb-4">
    {initials === undefined ? (
      leftIcon && (
        <Icon name={leftIcon} variant="soft" color="primary" size={20} />
      )
    ) : (
      <UserAvatar photoUrl={avatarUrl} initials={initials} size={44} />
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
      {hasUnread && chatEnabled && (
        <View className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white bg-error" />
      )}
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
