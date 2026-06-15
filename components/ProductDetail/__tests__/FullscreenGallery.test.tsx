import { fireEvent, render } from "@testing-library/react-native";
import FullscreenGallery from "../FullscreenGallery";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe("FullscreenGallery", () => {
  const photos = ["https://img/1.jpg", "https://img/2.jpg"];

  it("renders the counter starting at the initial index", () => {
    const { getByText } = render(
      <FullscreenGallery
        photos={photos}
        initialIndex={0}
        visible
        onClose={jest.fn()}
      />,
    );
    expect(getByText("1/2")).toBeTruthy();
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <FullscreenGallery
        photos={photos}
        initialIndex={1}
        visible
        onClose={onClose}
      />,
    );
    fireEvent.press(getByTestId("btn-close-gallery"));
    expect(onClose).toHaveBeenCalled();
  });
});
