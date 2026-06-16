import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreatePublication,
  usePublication,
  useUpdatePublication,
} from "@/hooks/usePublications";
import { useUploadImage } from "@/hooks/useUploads";
import { DEFAULT_VALUES, MAX_PHOTOS } from "@/lib/commerce/publish/constants";
import type {
  PhotoItem,
  PhotoSource,
  PublishFormValues,
  PublishMode,
} from "@/lib/commerce/publish/types";
import {
  buildPublicationBody,
  isStep1Complete,
  isStep2Complete,
  parsePrice,
  publicationPhotosToItems,
  publicationToFormValues,
  sortCategories,
} from "@/lib/commerce/publish/utils";
import { useToast } from "@/stores/ui.store";

const schema = z
  .object({
    title: z.string().min(1, "Requerido").max(100, "Máximo 100 caracteres"),
    description: z
      .string()
      .min(1, "Requerido")
      .max(500, "Máximo 500 caracteres"),
    expiry_date: z
      .date()
      .nullable()
      .refine((value) => value !== null, { message: "Requerido" }),
    category_id: z.string().min(1, "Elegí una categoría"),
    is_donation: z.boolean(),
    final_price: z.string(),
    original_price: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.is_donation) return;
    const final = parsePrice(data.final_price);
    const original = parsePrice(data.original_price);
    if (final <= 0)
      ctx.addIssue({
        path: ["final_price"],
        code: "custom",
        message: "Ingresá un precio válido",
      });
    if (original <= 0)
      ctx.addIssue({
        path: ["original_price"],
        code: "custom",
        message: "Ingresá un precio válido",
      });
    if (final > 0 && original > 0 && final > original)
      ctx.addIssue({
        path: ["final_price"],
        code: "custom",
        message: "No puede superar al precio original",
      });
  });

export const usePublishProductScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const mode: PublishMode = id ? "edit" : "create";

  const { data: categories = [] } = useCategories();
  const { data: publication } = usePublication(id ?? "");
  const { mutateAsync: createPublication } = useCreatePublication();
  const { mutateAsync: updatePublication } = useUpdatePublication();
  const { mutateAsync: uploadImage } = useUploadImage();
  const { showWarning, showError, showSuccess } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const photoIdRef = useRef(0);
  const prefilledRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting },
  } = useForm<PublishFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  // Prefill del formulario cuando se edita una publicación existente.
  useEffect(() => {
    if (mode !== "edit" || !publication || prefilledRef.current) return;
    prefilledRef.current = true;
    reset(publicationToFormValues(publication));
    setPhotos(publicationPhotosToItems(publication.photos));
  }, [mode, publication, reset]);

  const values = watch();
  const sortedCategories = useMemo(
    () => sortCategories(categories),
    [categories],
  );

  const photoUrls = photos
    .filter((photo) => photo.url)
    .map((photo) => photo.url as string);
  const isUploadingPhotos = photos.some(
    (photo) => photo.status === "uploading",
  );

  const isStep1 = step === 1;
  const isEdit = mode === "edit";
  // Se requiere al menos una foto subida para crear o editar.
  const hasPhoto = photoUrls.length > 0;
  const canContinue = isStep1Complete(values) && hasPhoto;
  const canPublish = isStep2Complete(values) && !isUploadingPhotos && hasPhoto;

  const requestPermission = async (source: PhotoSource): Promise<boolean> => {
    const result =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.status !== "granted") {
      Alert.alert(
        source === "camera"
          ? "Sin acceso a la cámara"
          : "Sin acceso a la galería",
        "Permití el acceso en Configuración para agregar fotos.",
      );
      return false;
    }
    return true;
  };

  const launchPicker = (source: PhotoSource) =>
    source === "camera"
      ? ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: Platform.OS === "ios",
        })
      : ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          quality: 0.8,
          allowsEditing: Platform.OS === "ios",
        });

  const uploadPhoto = async (uri: string) => {
    photoIdRef.current += 1;
    const photoId = `${photoIdRef.current}`;
    setPhotos((prev) => [
      ...prev,
      { id: photoId, uri, url: null, status: "uploading" },
    ]);
    try {
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: "image/jpeg",
        name: "photo.jpg",
      } as unknown as Blob);
      const { url } = await uploadImage(formData);
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === photoId ? { ...photo, url, status: "done" } : photo,
        ),
      );
    } catch {
      // Error toast automático por QueryProvider. Quitar el placeholder fallido.
      setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    }
  };

  const addPhoto = async (source: PhotoSource) => {
    try {
      const granted = await requestPermission(source);
      if (!granted) return;
      const result = await launchPicker(source);
      if (result.canceled || !result.assets?.[0]) return;
      await uploadPhoto(result.assets[0].uri);
    } catch {
      showError("No se pudo agregar la foto. Intentá de nuevo.");
    }
  };

  const handlePickPhoto = () => {
    if (isUploadingPhotos) {
      showWarning("Esperá a que termine de subir la imagen actual");
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      showWarning(`Podés agregar hasta ${MAX_PHOTOS} imágenes`);
      return;
    }
    Alert.alert("Agregar foto", undefined, [
      { text: "Cámara", onPress: () => void addPhoto("camera") },
      { text: "Galería", onPress: () => void addPhoto("library") },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleRemovePhoto = (photoId: string) =>
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));

  const handleSelectCategory = (categoryId: string) =>
    setValue("category_id", categoryId, { shouldValidate: true });
  const handleSelectDate = (date: Date) =>
    setValue("expiry_date", date, { shouldValidate: true });
  const handleToggleDonation = (value: boolean) =>
    setValue("is_donation", value, { shouldValidate: true });

  // Si el precio de venta iguala al original, es de hecho una donación
  // (descuento 100%): activamos el toggle automáticamente.
  const maybeEnableDonation = (finalStr: string, originalStr: string) => {
    const final = parsePrice(finalStr);
    const original = parsePrice(originalStr);
    if (final > 0 && original > 0 && final === original) {
      setValue("is_donation", true, { shouldValidate: true });
    }
  };

  const handleChangeFinalPrice = (text: string) => {
    const value = text.replace(/\D/g, "");
    setValue("final_price", value, { shouldValidate: true });
    maybeEnableDonation(value, getValues("original_price"));
  };

  const handleChangeOriginalPrice = (text: string) => {
    const value = text.replace(/\D/g, "");
    setValue("original_price", value, { shouldValidate: true });
    maybeEnableDonation(getValues("final_price"), value);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }
    // En edición la pantalla es apilada (volvemos al detalle); en creación es
    // el tab "Publicar", así que volvemos al home del comercio.
    if (isEdit) {
      router.back();
      return;
    }
    router.navigate("/(commerce)/home");
  };

  const handleContinue = () => {
    if (canContinue) setStep(2);
  };

  const handleSubmitPublish = handleSubmit(async (formValues) => {
    const body = buildPublicationBody(formValues, photoUrls);
    try {
      if (isEdit && id) {
        await updatePublication({ id, body });
        showSuccess("Publicación actualizada");
        router.back();
        return;
      }
      await createPublication(body);
      setIsSuccessVisible(true);
    } catch {
      // Error toast automático por QueryProvider
    }
  });

  const handleSuccessDone = () => {
    setIsSuccessVisible(false);
    // El tab "Publicar" permanece montado: reseteamos para que la próxima
    // visita arranque en blanco.
    reset(DEFAULT_VALUES);
    setPhotos([]);
    setStep(1);
    router.replace("/(commerce)/home");
  };

  let ctaLabel: string;
  if (isStep1) {
    ctaLabel = "Continuar";
  } else if (isEdit) {
    ctaLabel = "Guardar cambios";
  } else {
    ctaLabel = "Publicar producto";
  }

  return {
    headerTitle: isEdit ? "Editar publicación" : "Nueva publicación",
    control,
    step,
    photos,
    sortedCategories,
    selectedCategoryId: values.category_id,
    expiryDate: values.expiry_date,
    isDonation: values.is_donation,
    isUploadingPhotos,
    isSubmitting,
    showSuccess: isSuccessVisible,
    ctaLabel,
    ctaDisabled: isStep1 ? !canContinue : !canPublish || isSubmitting,
    onCtaPress: isStep1 ? handleContinue : handleSubmitPublish,
    handleBack,
    handlePickPhoto,
    handleRemovePhoto,
    handleSelectCategory,
    handleSelectDate,
    handleToggleDonation,
    handleChangeFinalPrice,
    handleChangeOriginalPrice,
    handleSuccessDone,
  };
};
