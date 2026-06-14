import { View } from "react-native";
import { Controller, type Control } from "react-hook-form";
import type { Category } from "@/api/categories/categories.types";
import Input from "@/components/ui/Input";
import type {
  PhotoItem,
  PublishFormValues,
} from "@/lib/commerce/publish/types";
import CategorySelector from "./CategorySelector";
import ExpiryDateField from "./ExpiryDateField";
import PhotoUploader from "./PhotoUploader";

interface Step1InfoProps {
  control: Control<PublishFormValues>;
  photos: PhotoItem[];
  isUploadingPhotos: boolean;
  onPickPhoto: () => void;
  onRemovePhoto: (id: string) => void;
  expiryDate: Date | null;
  onSelectDate: (date: Date) => void;
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const Step1Info = ({
  control,
  photos,
  isUploadingPhotos,
  onPickPhoto,
  onRemovePhoto,
  expiryDate,
  onSelectDate,
  categories,
  selectedCategoryId,
  onSelectCategory,
}: Step1InfoProps) => (
  <View className="gap-4">
    <PhotoUploader
      photos={photos}
      isUploading={isUploadingPhotos}
      onPick={onPickPhoto}
      onRemove={onRemovePhoto}
    />

    <Controller
      control={control}
      name="title"
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Input
          value={value}
          onChangeText={onChange}
          placeholder="Nombre del producto"
          hint="Ej: Mix de Verduras Frescas"
          error={error?.message}
          autoCapitalize="sentences"
          testID="input-title"
        />
      )}
    />

    <Controller
      control={control}
      name="description"
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Input
          value={value}
          onChangeText={onChange}
          placeholder="Descripción"
          hint="Describí el contenido y estado del producto"
          multiline
          numberOfLines={4}
          error={error?.message}
          autoCapitalize="sentences"
          testID="input-description"
        />
      )}
    />

    <ExpiryDateField value={expiryDate} onChange={onSelectDate} />

    <CategorySelector
      categories={categories}
      selectedId={selectedCategoryId}
      onSelect={onSelectCategory}
    />
  </View>
);

export default Step1Info;
