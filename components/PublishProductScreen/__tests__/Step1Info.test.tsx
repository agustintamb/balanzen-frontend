import { render, fireEvent } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import Step1Info from "../Step1Info";
import type { PublishFormValues, PhotoItem } from "@/lib/commerce/publish/types";
import type { Category } from "@/api/categories/categories.types";

jest.mock("expo-image", () => ({
  Image: ({ source }: any) => {
    const { View } = require("react-native");
    return <View testID={`img-${source?.uri}`} />;
  },
}));
jest.mock("@/components/ui/Icon", () => {
  const { View } = require("react-native");
  return ({ name }: any) => <View testID={`icon-${name}`} />;
});
jest.mock("@/components/ui/Input", () => {
  const { TextInput } = require("react-native");
  return ({ testID, value, onChangeText, placeholder, error }: any) => (
    <TextInput
      testID={testID ?? placeholder}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  );
});
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));
jest.mock("@/lib/commerce/publish/constants", () => ({ MAX_PHOTOS: 3 }));

jest.mock("../PhotoUploader", () => {
  const { View } = require("react-native");
  return ({ onPick }: any) => <View testID="photo-uploader" onTouchEnd={onPick} />;
});
jest.mock("../ExpiryDateField", () => {
  const { View } = require("react-native");
  return ({ value }: any) => <View testID="expiry-date-field" />;
});
jest.mock("../CategorySelector", () => {
  const { View } = require("react-native");
  return ({ categories, selectedId, onSelect }: any) => (
    <View testID="category-selector" />
  );
});

const categories: Category[] = [
  { id: "cat-1", name: "Verduras" },
  { id: "cat-2", name: "Frutas" },
];

const defaultPhotos: PhotoItem[] = [];

interface WrapperProps {
  photos?: PhotoItem[];
  isUploadingPhotos?: boolean;
  onPickPhoto?: () => void;
  onRemovePhoto?: (id: string) => void;
  expiryDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  categories?: Category[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
}

const Wrapper = ({
  photos = defaultPhotos,
  isUploadingPhotos = false,
  onPickPhoto = jest.fn(),
  onRemovePhoto = jest.fn(),
  expiryDate = null,
  onSelectDate = jest.fn(),
  categories: cats = categories,
  selectedCategoryId = "",
  onSelectCategory = jest.fn(),
}: WrapperProps) => {
  const { control } = useForm<PublishFormValues>({
    defaultValues: { title: "", description: "" } as PublishFormValues,
  });
  return (
    <Step1Info
      control={control}
      photos={photos}
      isUploadingPhotos={isUploadingPhotos}
      onPickPhoto={onPickPhoto}
      onRemovePhoto={onRemovePhoto}
      expiryDate={expiryDate}
      onSelectDate={onSelectDate}
      categories={cats}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={onSelectCategory}
    />
  );
};

describe("Step1Info", () => {
  it("renders PhotoUploader", () => {
    const { getByTestId } = render(<Wrapper />);
    expect(getByTestId("photo-uploader")).toBeTruthy();
  });

  it("renders ExpiryDateField", () => {
    const { getByTestId } = render(<Wrapper />);
    expect(getByTestId("expiry-date-field")).toBeTruthy();
  });

  it("renders CategorySelector with categories", () => {
    const { getByTestId } = render(<Wrapper categories={categories} />);
    expect(getByTestId("category-selector")).toBeTruthy();
  });

  it("renders Input with placeholder 'Nombre del producto'", () => {
    const { getByPlaceholderText } = render(<Wrapper />);
    expect(getByPlaceholderText("Nombre del producto")).toBeTruthy();
  });

  it("renders Input with placeholder 'Descripción'", () => {
    const { getByPlaceholderText } = render(<Wrapper />);
    expect(getByPlaceholderText("Descripción")).toBeTruthy();
  });

  it("calls onPickPhoto when PhotoUploader's onPick is triggered", () => {
    const onPickPhoto = jest.fn();
    const { getByTestId } = render(<Wrapper onPickPhoto={onPickPhoto} />);
    fireEvent(getByTestId("photo-uploader"), "touchEnd");
    expect(onPickPhoto).toHaveBeenCalledTimes(1);
  });
});
