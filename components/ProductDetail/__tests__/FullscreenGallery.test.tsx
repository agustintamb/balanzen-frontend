import { fireEvent, render } from "@testing-library/react-native";
import FullscreenGallery from "../FullscreenGallery";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));
jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 300, height: 600, scale: 1, fontScale: 1 }),
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

  it("updates the counter on scroll end", () => {
    const { getByTestId, getByText } = render(
      <FullscreenGallery
        photos={photos}
        initialIndex={0}
        visible
        onClose={jest.fn()}
      />,
    );
    fireEvent(getByTestId("gallery-scroll"), "momentumScrollEnd", {
      nativeEvent: { contentOffset: { x: 300, y: 0 } },
    });
    expect(getByText("2/2")).toBeTruthy();
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
