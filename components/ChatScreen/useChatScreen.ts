import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { buildFullName, getInitials } from "@/components/ProductDetail/utils";
import { useChatMessages, useChats, useSendMessage } from "@/hooks/useChats";
import { useUploadImage } from "@/hooks/useUploads";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";
import { useChatSocket } from "./useChatSocket";

type ImageSource = "camera" | "library";

// Cuánto esperar sin tipear antes de avisar que dejé de escribir.
const TYPING_IDLE_MS = 2500;

export interface ChatBubble {
  id: string;
  content: string;
  isMine: boolean;
  time: string;
  /** Si el mensaje es una imagen, su URL; si no, undefined. */
  imageUrl?: string;
}

const IMAGE_EXT_RE = /\.(jpg|jpeg|png|webp|gif)(\?|$)/i;

const isImageUrl = (content: string): boolean =>
  /^https?:\/\//.test(content) &&
  (content.includes("res.cloudinary.com") || IMAGE_EXT_RE.test(content));

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const useChatScreen = () => {
  const router = useRouter();
  const { orderId = "" } = useLocalSearchParams<{ orderId: string }>();
  const userId = useAuthStore((s) => s.user?.id);
  const { showWarning, showError } = useToast();

  const { data: messagesData, isLoading, refetch } = useChatMessages(orderId);
  const { data: chats } = useChats();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(orderId);
  const { mutateAsync: uploadImage } = useUploadImage();
  const { isOtherTyping, notifyTyping } = useChatSocket(orderId);

  const [draft, setDraft] = useState("");
  const [isAttaching, setIsAttaching] = useState(false);
  // Solo para el pull-to-refresh manual: un mensaje entrante refetchea en
  // background sin mostrar el spinner.
  const [isRefreshing, setIsRefreshing] = useState(false);
  const typingIdleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const stopTyping = () => {
    clearTimeout(typingIdleTimer.current);
    notifyTyping(false);
  };

  // Avisar "dejó de escribir" si se desmonta el chat con un timer pendiente.
  useEffect(() => () => clearTimeout(typingIdleTimer.current), []);

  const handleChangeDraft = (text: string) => {
    setDraft(text);
    notifyTyping(true);
    clearTimeout(typingIdleTimer.current);
    typingIdleTimer.current = setTimeout(
      () => notifyTyping(false),
      TYPING_IDLE_MS,
    );
  };

  const counterpart = chats?.find((c) => c.order_id === orderId)?.counterpart;
  const counterpartName = counterpart
    ? (counterpart.business_name ??
      buildFullName(counterpart.first_name, counterpart.last_name))
    : "Chat";
  const counterpartInitials = counterpart ? getInitials(counterpartName) : "";
  const counterpartPhotoUrl = counterpart?.photo_url ?? null;

  const messages = useMemo<ChatBubble[]>(() => {
    const list = messagesData?.messages ?? [];
    return [...list]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((msg) => ({
        id: msg.id,
        content: msg.content,
        isMine: msg.sender_id === userId,
        time: formatTime(msg.created_at),
        imageUrl: isImageUrl(msg.content) ? msg.content : undefined,
      }));
  }, [messagesData, userId]);

  const handleSend = () => {
    const content = draft.trim();
    if (!content || isSending) return;
    sendMessage(content);
    setDraft("");
    stopTyping();
  };

  const attachFrom = async (source: ImageSource) => {
    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        showWarning(
          source === "camera"
            ? "Permití el acceso a la cámara para enviar fotos."
            : "Permití el acceso a la galería para enviar fotos.",
        );
        return;
      }
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: "images",
              quality: 0.8,
            });
      if (result.canceled || !result.assets?.[0]) return;

      setIsAttaching(true);
      const formData = new FormData();
      formData.append("image", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: "chat.jpg",
      } as unknown as Blob);
      const { url } = await uploadImage(formData);
      sendMessage(url);
    } catch {
      showError("No se pudo enviar la imagen. Intentá de nuevo.");
    } finally {
      setIsAttaching(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAttach = () => {
    if (isAttaching) return;
    Alert.alert("Enviar foto", undefined, [
      { text: "Cámara", onPress: () => void attachFrom("camera") },
      { text: "Galería", onPress: () => void attachFrom("library") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return {
    isLoading,
    isRefreshing,
    counterpartName,
    counterpartInitials,
    counterpartPhotoUrl,
    isOtherTyping,
    messages,
    draft,
    isSending,
    isAttaching,
    onChangeDraft: handleChangeDraft,
    handleSend,
    handleAttach,
    handleRefresh,
    handleBack: () => router.back(),
  };
};
