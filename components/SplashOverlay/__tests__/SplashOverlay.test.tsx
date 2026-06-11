import { act, render } from "@testing-library/react-native";
import SplashOverlay from "@/components/SplashOverlay";

jest.mock("lottie-react-native", () => "LottieView");
jest.mock("expo-linear-gradient", () => ({ LinearGradient: "LinearGradient" }));

jest.mock("@/assets/images/balanzen-logo.png", () => 1);
jest.mock("@/assets/lottie-animations/dots.json", () => ({}));

jest.useFakeTimers();

const SPLASH_DURATION_MS = 1000;
const FADE_DURATION_MS = 200;

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

describe("SplashOverlay", () => {
  describe("initial render — splash visible", () => {
    it("should render the animated container when splash is visible", () => {
      const { UNSAFE_getAllByType } = render(<SplashOverlay />);
      const { Animated } = require("react-native");

      // The Animated.View renders — confirms the overlay is in the tree
      const animatedViews = UNSAFE_getAllByType(Animated.View);
      expect(animatedViews.length).toBeGreaterThan(0);
    });

    it("should render LottieView when splash is visible", () => {
      const { UNSAFE_getByType } = render(<SplashOverlay />);

      const lottie = UNSAFE_getByType(
        "LottieView" as unknown as React.ComponentType,
      );
      expect(lottie).toBeTruthy();
    });

    it("should render LottieView with autoPlay and loop props", () => {
      const { UNSAFE_getByType } = render(<SplashOverlay />);

      const lottie = UNSAFE_getByType(
        "LottieView" as unknown as React.ComponentType,
      );
      expect(lottie.props.autoPlay).toBe(true);
      expect(lottie.props.loop).toBe(true);
    });

    it("should render the LinearGradient when splash is visible", () => {
      const { UNSAFE_getByType } = render(<SplashOverlay />);

      const gradient = UNSAFE_getByType(
        "LinearGradient" as unknown as React.ComponentType,
      );
      expect(gradient).toBeTruthy();
    });

    it("should render LinearGradient with the correct gradient colors", () => {
      const { UNSAFE_getByType } = render(<SplashOverlay />);

      const gradient = UNSAFE_getByType(
        "LinearGradient" as unknown as React.ComponentType,
      );
      expect(gradient.props.colors).toEqual([
        "#1A3408",
        "#22470C",
        "#2D6012",
        "#3A7A1C",
      ]);
    });

    it("should render the logo Image when splash is visible", () => {
      const { UNSAFE_getAllByType } = render(<SplashOverlay />);
      const { Image } = require("react-native");

      const images = UNSAFE_getAllByType(Image);
      expect(images.length).toBeGreaterThan(0);
    });

    it("should render the Animated.View with pointerEvents none", () => {
      const { UNSAFE_getAllByType } = render(<SplashOverlay />);
      const { Animated } = require("react-native");

      const animatedViews = UNSAFE_getAllByType(Animated.View);
      const overlay = animatedViews[0];
      expect(overlay.props.pointerEvents).toBe("none");
    });
  });

  describe("after animation completes — splash hidden", () => {
    it("should return null after the full splash and fade duration", () => {
      const { toJSON } = render(<SplashOverlay />);

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS + FADE_DURATION_MS);
      });

      expect(toJSON()).toBeNull();
    });

    it("should return null after runAllTimers", () => {
      const { toJSON } = render(<SplashOverlay />);

      act(() => {
        jest.runAllTimers();
      });

      expect(toJSON()).toBeNull();
    });

    it("should not render LottieView after the animation completes", () => {
      const { UNSAFE_queryByType } = render(<SplashOverlay />);

      act(() => {
        jest.runAllTimers();
      });

      const lottie = UNSAFE_queryByType(
        "LottieView" as unknown as React.ComponentType,
      );
      expect(lottie).toBeNull();
    });

    it("should not render LinearGradient after the animation completes", () => {
      const { UNSAFE_queryByType } = render(<SplashOverlay />);

      act(() => {
        jest.runAllTimers();
      });

      const gradient = UNSAFE_queryByType(
        "LinearGradient" as unknown as React.ComponentType,
      );
      expect(gradient).toBeNull();
    });

    it("should still be visible before the splash duration elapses", () => {
      const { UNSAFE_getByType } = render(<SplashOverlay />);

      act(() => {
        jest.advanceTimersByTime(SPLASH_DURATION_MS - 1);
      });

      const lottie = UNSAFE_getByType(
        "LottieView" as unknown as React.ComponentType,
      );
      expect(lottie).toBeTruthy();
    });
  });

  describe("LottieView animation source", () => {
    it("should pass a source prop to LottieView", () => {
      const { UNSAFE_getByType } = render(<SplashOverlay />);

      const lottie = UNSAFE_getByType(
        "LottieView" as unknown as React.ComponentType,
      );
      expect(lottie.props.source).toBeDefined();
    });
  });
});
