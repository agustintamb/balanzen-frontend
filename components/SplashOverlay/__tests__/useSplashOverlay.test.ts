import { Animated } from "react-native";
import { act, renderHook } from "@testing-library/react-native";
import { useSplashOverlay } from "@/components/SplashOverlay/useSplashOverlay";

const SPLASH_DURATION_MS = 1000;
const FADE_DURATION_MS = 200;

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("useSplashOverlay", () => {
  describe("initial state", () => {
    it("should return visible as true on mount", () => {
      const { result } = renderHook(() => useSplashOverlay());

      expect(result.current.visible).toBe(true);
    });

    it("should return an Animated.Value as opacity", () => {
      const { result } = renderHook(() => useSplashOverlay());

      expect(result.current.opacity).toBeInstanceOf(Animated.Value);
    });

    it("should have opacity initialized to 1", () => {
      const { result } = renderHook(() => useSplashOverlay());

      expect(
        (result.current.opacity as unknown as { _value: number })._value,
      ).toBe(1);
    });

    it("should not hide splash before the splash duration elapses", () => {
      const { result } = renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS - 1);
      });

      expect(result.current.visible).toBe(true);
    });
  });

  describe("after animation completes", () => {
    it("should set visible to false after splash duration + fade duration", () => {
      const { result } = renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS + FADE_DURATION_MS);
      });

      expect(result.current.visible).toBe(false);
    });

    it("should set visible to false after runAllTimers", () => {
      const { result } = renderHook(() => useSplashOverlay());

      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.visible).toBe(false);
    });

    it("should animate opacity to 0 after splash duration elapses", () => {
      const timingSpy = jest.spyOn(Animated, "timing");

      renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS);
      });

      expect(timingSpy).toHaveBeenCalledTimes(1);
      expect(timingSpy).toHaveBeenCalledWith(
        expect.any(Animated.Value),
        expect.objectContaining({
          toValue: 0,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }),
      );

      timingSpy.mockRestore();
    });

    it("should not trigger fade animation before splash duration elapses", () => {
      const timingSpy = jest.spyOn(Animated, "timing");

      renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS - 1);
      });

      expect(timingSpy).not.toHaveBeenCalled();

      timingSpy.mockRestore();
    });
  });

  describe("fade animation configuration", () => {
    it("should call Animated.timing with useNativeDriver set to true", () => {
      const timingSpy = jest.spyOn(Animated, "timing");

      renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS);
      });

      expect(timingSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ useNativeDriver: true }),
      );

      timingSpy.mockRestore();
    });

    it("should call Animated.timing with duration of 200ms", () => {
      const timingSpy = jest.spyOn(Animated, "timing");

      renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS);
      });

      expect(timingSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ duration: FADE_DURATION_MS }),
      );

      timingSpy.mockRestore();
    });

    it("should call Animated.timing with toValue of 0", () => {
      const timingSpy = jest.spyOn(Animated, "timing");

      renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS);
      });

      expect(timingSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ toValue: 0 }),
      );

      timingSpy.mockRestore();
    });

    it("should start the fade animation exactly once", () => {
      const timingSpy = jest.spyOn(Animated, "timing");

      renderHook(() => useSplashOverlay());

      act(() => {
        jest.runAllTimers();
      });

      expect(timingSpy).toHaveBeenCalledTimes(1);

      timingSpy.mockRestore();
    });
  });

  describe("cleanup", () => {
    it("should clear the timer on unmount before splash duration elapses", () => {
      const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

      const { unmount } = renderHook(() => useSplashOverlay());

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS - 1);
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it("should not set visible to false after unmount even when timers run", () => {
      const { result, unmount } = renderHook(() => useSplashOverlay());

      unmount();

      act(() => {
        jest.runAllTimers();
      });

      // visible remains true — setState on unmounted hook does not throw and state is stale
      expect(result.current.visible).toBe(true);
    });
  });

  describe("return value shape", () => {
    it("should return exactly visible and opacity properties", () => {
      const { result } = renderHook(() => useSplashOverlay());

      const keys = Object.keys(result.current);
      expect(keys).toContain("visible");
      expect(keys).toContain("opacity");
      expect(keys).toHaveLength(2);
    });

    it("should keep the same opacity reference across re-renders", () => {
      const { result, rerender } = renderHook(() => useSplashOverlay());

      const firstOpacity = result.current.opacity;
      rerender({});

      expect(result.current.opacity).toBe(firstOpacity);
    });
  });
});
