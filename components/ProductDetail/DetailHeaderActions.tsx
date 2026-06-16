import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "@/components/ui/Icon";
import { cn } from "@/utils/cn";

interface DetailHeaderActionsProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
}

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

const DetailHeaderActions = ({
  isFavorite,
  onToggleFavorite,
  onShare,
}: DetailHeaderActionsProps) => (
  <>
    <TouchableOpacity
      onPress={onToggleFavorite}
      hitSlop={HIT_SLOP}
      className={cn(
        "h-10 w-10 items-center justify-center rounded-full",
        isFavorite ? "bg-error-light" : "bg-white",
      )}
      testID="btn-favorite"
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={20}
        color={isFavorite ? "#E84234" : "#27500A"}
      />
    </TouchableOpacity>
    <TouchableOpacity
      onPress={onShare}
      hitSlop={HIT_SLOP}
      className="h-10 w-10 items-center justify-center rounded-full bg-white"
      testID="btn-share"
    >
      <Icon name="share-2" size={18} color="primary-dark" />
    </TouchableOpacity>
  </>
);

export default DetailHeaderActions;
