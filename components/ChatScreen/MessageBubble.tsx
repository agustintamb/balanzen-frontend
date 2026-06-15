import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import FullscreenGallery from "@/components/ProductDetail/FullscreenGallery";
import { buildCardImageUrl } from "@/utils/cloudinary";
import { cn } from "@/utils/cn";
import type { ChatBubble } from "./useChatScreen";

interface MessageBubbleProps {
  message: ChatBubble;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [viewerVisible, setViewerVisible] = useState(false);

  return (
    <View
      style={{ minWidth: 96, maxWidth: "80%" }}
      className={cn(
        "rounded-2xl px-3.5 py-2.5",
        message.isMine
          ? "self-end rounded-br-md bg-primary-light"
          : "self-start rounded-bl-md bg-white",
      )}
    >
      {message.imageUrl ? (
        <>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setViewerVisible(true)}
            testID="message-image"
          >
            <Image
              source={{ uri: buildCardImageUrl(message.imageUrl) }}
              style={{ width: 200, height: 200, borderRadius: 12 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <FullscreenGallery
            photos={[message.imageUrl]}
            initialIndex={0}
            visible={viewerVisible}
            onClose={() => setViewerVisible(false)}
          />
        </>
      ) : (
        <Text className="font-sans text-sm text-primary-dark">
          {message.content}
        </Text>
      )}
      <Text
        className={cn(
          "mt-1 self-end font-sans text-[10px]",
          message.isMine ? "text-primary/60" : "text-gray-400",
        )}
      >
        {message.time}
      </Text>
    </View>
  );
};

export default MessageBubble;
