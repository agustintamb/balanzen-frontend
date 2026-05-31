import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Platform, TextInput } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUploadImage } from "@/hooks/useUploads";
import { useCurrentUser, useUpdateProfile } from "@/hooks/useUsers";
import { useToast } from "@/stores/ui.store";
import { buildDetailImageUrl, buildProfilePhotoUrl } from "@/utils/cloudinary";
import { DIGITS_REGEX, EMAIL_REGEX, NAME_REGEX } from "@/utils/validation";

const schema = z.object({
  business_name: z
    .string()
    .min(1, "Requerido")
    .max(100, "Máximo 100 caracteres")
    .optional(),
  first_name: z
    .string()
    .min(1, "Requerido")
    .max(50, "Máximo 50 caracteres")
    .regex(NAME_REGEX, "Solo letras y espacios"),
  last_name: z
    .string()
    .min(1, "Requerido")
    .max(50, "Máximo 50 caracteres")
    .regex(NAME_REGEX, "Solo letras y espacios"),
  email: z.string().min(1, "Requerido").regex(EMAIL_REGEX, "Email inválido"),
  phone: z
    .string()
    .min(1, "Requerido")
    .max(20, "Máximo 20 dígitos")
    .regex(DIGITS_REGEX, "Solo números"),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type FormValues = z.infer<typeof schema>;

export const useEditProfileScreen = () => {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { mutateAsync: uploadImage } = useUploadImage();
  const { showSuccess } = useToast();

  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [androidKeyboardPad, setAndroidKeyboardPad] = useState(0);

  const businessNameRef = useRef<TextInput>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      reset({
        business_name: user.business_name ?? "",
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        description: user.description ?? "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setAndroidKeyboardPad(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardPad(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // displayPhotoUrl: preferir la URI local (optimista) mientras sube,
  // de lo contrario usar la URL del usuario en caché.
  const cachedPhotoUrl = user?.photo_url
    ? buildProfilePhotoUrl(user.photo_url)
    : null;
  const displayPhotoUrl = localPhotoUri ?? cachedPhotoUrl;

  const cachedPhotoFullUrl = user?.photo_url
    ? buildDetailImageUrl(user.photo_url)
    : null;
  const displayPhotoFullUrl = localPhotoUri ?? cachedPhotoFullUrl;

  const isCommerce = user?.role === "COMERCIO";
  const initials = user
    ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    : "";

  const handleBack = () => router.back();

  const uploadPhoto = async (uri: string) => {
    setLocalPhotoUri(uri);
    setIsPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as unknown as Blob);
      const { url } = await uploadImage(formData);
      await updateProfile({ photo_url: url });
      showSuccess("Foto de perfil actualizada");
    } catch {
      // Error toast shown automatically by QueryProvider. Revert local preview.
      setLocalPhotoUri(null);
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const pickImage = async (source: "library" | "camera") => {
    if (source === "library") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sin acceso a la galería",
          "Permití el acceso en Configuración para cambiar tu foto.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sin acceso a la cámara",
          "Permití el acceso en Configuración para tomar una foto.",
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    }
  };

  const handleAvatarPress = () => {
    if (isPhotoUploading) return;
    Alert.alert("Cambiar foto de perfil", undefined, [
      { text: "Galería", onPress: () => pickImage("library") },
      { text: "Cámara", onPress: () => pickImage("camera") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleSave = handleSubmit(async (values) => {
    await updateProfile({
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone,
      ...(isCommerce
        ? {
            business_name: values.business_name,
            description: values.description?.trim() || null,
          }
        : {}),
    });
    showSuccess("Perfil actualizado");
    router.back();
  });

  return {
    control,
    isDirty,
    isValid,
    isSubmitting,
    isPhotoUploading,
    isCommerce,
    androidKeyboardPad,
    displayPhotoUrl,
    displayPhotoFullUrl,
    initials,
    businessNameRef,
    firstNameRef,
    lastNameRef,
    emailRef,
    phoneRef,
    descriptionRef,
    handleBack,
    handleAvatarPress,
    handleSave,
  };
};

// Expo Router requires a default export in app/ — this is a hook, not a screen
export default function _() {
  return null;
}
