import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon, { type IconColor, type IconName } from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

export type NoticeTone = "success" | "error" | "muted";

export interface StatusNotice {
  icon: IconName;
  tone: NoticeTone;
  text: string;
}

const TONE: Record<
  NoticeTone,
  { border: string; icon: IconColor; text: string }
> = {
  success: {
    border: "border-primary-light",
    icon: "primary",
    text: "text-primary",
  },
  error: { border: "border-error-light", icon: "error", text: "text-error" },
  muted: {
    border: "border-surface-dark",
    icon: "muted",
    text: "text-gray-400",
  },
};

const StatusNoticeBanner = ({ icon, tone, text }: StatusNotice) => {
  const t = TONE[tone];
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} className="bg-white">
      <View
        className={cn(
          "flex-row items-center gap-2 border-t px-5 pb-2 pt-3",
          t.border,
        )}
      >
        <Icon name={icon} size={18} color={t.icon} />
        <Text className={cn("flex-1 font-sans-medium text-sm", t.text)}>
          {text}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default StatusNoticeBanner;
