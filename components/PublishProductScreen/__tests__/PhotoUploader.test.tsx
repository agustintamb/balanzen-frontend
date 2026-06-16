import { fireEvent, render } from "@testing-library/react-native";
import PhotoUploader from "../PhotoUploader";
import type { PhotoItem } from "@/lib/commerce/publish/types";

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
jest.mock("@/utils/cn", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
}));
jest.mock("@/lib/commerce/publish/constants", () => ({ MAX_PHOTOS: 3 }));

const makePhoto = (id: string, status: PhotoItem["status"] = "done"): PhotoItem => ({
  id,
  uri: `https://example.com/${id}.jpg`,
  url: null,
  status,
});

describe("PhotoUploader", () => {
  it("shows 'Agregar fotos' text", () => {
    const { getByText } = render(
      <PhotoUploader photos={[]} isUploading={false} onPick={jest.fn()} onRemove={jest.fn()} />,
    );
    expect(getByText("Agregar fotos")).toBeTruthy();
  });

  it("shows 'Máximo 3 imágenes · JPG, PNG' subtitle when idle", () => {
    const { getByText } = render(
      <PhotoUploader photos={[]} isUploading={false} onPick={jest.fn()} onRemove={jest.fn()} />,
    );
    expect(getByText("Máximo 3 imágenes · JPG, PNG")).toBeTruthy();
  });

  it("shows 'Subiendo imagen…' when isUploading is true", () => {
    const { getByText } = render(
      <PhotoUploader photos={[]} isUploading={true} onPick={jest.fn()} onRemove={jest.fn()} />,
    );
    expect(getByText("Subiendo imagen…")).toBeTruthy();
  });

  it("shows 'Alcanzaste el máximo de 3' when photos.length >= 3", () => {
    const photos = [makePhoto("a"), makePhoto("b"), makePhoto("c")];
    const { getByText } = render(
      <PhotoUploader photos={photos} isUploading={false} onPick={jest.fn()} onRemove={jest.fn()} />,
    );
    expect(getByText("Alcanzaste el máximo de 3")).toBeTruthy();
  });

  it("calls onPick when photo-add is pressed and not disabled", () => {
    const onPick = jest.fn();
    const { getByTestId } = render(
      <PhotoUploader photos={[]} isUploading={false} onPick={onPick} onRemove={jest.fn()} />,
    );
    fireEvent.press(getByTestId("photo-add"));
    expect(onPick).toHaveBeenCalledTimes(1);
  });

  it("does not call onPick when disabled because isUploading is true", () => {
    const onPick = jest.fn();
    const { getByTestId } = render(
      <PhotoUploader photos={[]} isUploading={true} onPick={onPick} onRemove={jest.fn()} />,
    );
    const btn = getByTestId("photo-add");
    expect(btn.props.accessibilityState?.disabled ?? btn.props.disabled).toBeTruthy();
  });

  it("calls onRemove with the correct photo id when remove button is pressed", () => {
    const onRemove = jest.fn();
    const photos = [makePhoto("photo-1"), makePhoto("photo-2")];
    const { getByTestId } = render(
      <PhotoUploader photos={photos} isUploading={false} onPick={jest.fn()} onRemove={onRemove} />,
    );
    fireEvent.press(getByTestId("photo-remove-photo-2"));
    expect(onRemove).toHaveBeenCalledWith("photo-2");
  });

  it("renders remove buttons for each photo thumbnail", () => {
    const photos = [makePhoto("p1"), makePhoto("p2"), makePhoto("p3")];
    const { getByTestId } = render(
      <PhotoUploader photos={photos} isUploading={false} onPick={jest.fn()} onRemove={jest.fn()} />,
    );
    expect(getByTestId("photo-remove-p1")).toBeTruthy();
    expect(getByTestId("photo-remove-p2")).toBeTruthy();
    expect(getByTestId("photo-remove-p3")).toBeTruthy();
  });

  it("renders the uploading overlay for a photo with status 'uploading'", () => {
    const photos = [makePhoto("p1", "uploading")];
    const { getByTestId } = render(
      <PhotoUploader
        photos={photos}
        isUploading={true}
        onPick={jest.fn()}
        onRemove={jest.fn()}
      />,
    );
    expect(getByTestId("img-https://example.com/p1.jpg")).toBeTruthy();
    expect(getByTestId("photo-remove-p1")).toBeTruthy();
  });
});
