import { fireEvent, render } from "@testing-library/react-native";
import DetailImageCarousel from "../DetailImageCarousel";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

describe("DetailImageCarousel", () => {
  it("renders the back button and triggers onBack", () => {
    const onBack = jest.fn();
    const { getByTestId } = render(
      <DetailImageCarousel
        photos={["https://img/1.jpg", "https://img/2.jpg"]}
        onBack={onBack}
      />,
    );
    fireEvent.press(getByTestId("btn-back"));
    expect(onBack).toHaveBeenCalled();
  });

  it("opens the fullscreen viewer when an image is pressed", () => {
    const { getByTestId } = render(
      <DetailImageCarousel
        photos={["https://img/1.jpg", "https://img/2.jpg"]}
        onBack={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId("carousel-image-0"));
    // El visor a pantalla completa muestra el contador.
    expect(getByTestId("btn-close-gallery")).toBeTruthy();
  });

  it("renders a placeholder when there are no photos", () => {
    const { queryByTestId } = render(
      <DetailImageCarousel photos={[]} onBack={jest.fn()} />,
    );
    expect(queryByTestId("carousel-image-0")).toBeNull();
  });
});
