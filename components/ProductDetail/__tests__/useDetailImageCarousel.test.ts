import { act, renderHook } from "@testing-library/react-native";
import { useDetailImageCarousel } from "../useDetailImageCarousel";

jest.mock("react-native/Libraries/Utilities/useWindowDimensions", () => ({
  __esModule: true,
  default: () => ({ width: 300, height: 600, scale: 1, fontScale: 1 }),
}));

describe("useDetailImageCarousel", () => {
  it("starts at index 0 with the viewer closed", () => {
    const { result } = renderHook(() => useDetailImageCarousel());
    expect(result.current.activeIndex).toBe(0);
    expect(result.current.viewerIndex).toBeNull();
  });

  it("updates the active index on scroll end", () => {
    const { result } = renderHook(() => useDetailImageCarousel());
    act(() =>
      result.current.handleScrollEnd({
        nativeEvent: { contentOffset: { x: 600 } },
      } as Parameters<typeof result.current.handleScrollEnd>[0]),
    );
    expect(result.current.activeIndex).toBe(2);
  });

  it("opens and closes the fullscreen viewer", () => {
    const { result } = renderHook(() => useDetailImageCarousel());
    act(() => result.current.openViewer(1));
    expect(result.current.viewerIndex).toBe(1);
    act(() => result.current.closeViewer());
    expect(result.current.viewerIndex).toBeNull();
  });
});
