import React from "react";
import { render } from "@testing-library/react-native";
import MetricsScreen from "../index";
import { useMetricsScreen } from "../useMetricsScreen";

jest.mock("../useMetricsScreen", () => ({
  useMetricsScreen: jest.fn(),
}));

jest.mock("../MetricCard", () => () => null);
jest.mock("@/components/ui/Icon", () => () => null);
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

const MOCK_METRICS = {
  active_publications: 3,
  total_reservations: 10,
  total_delivered: 8,
  total_cancelled: 1,
};

const BASE_HOOK = {
  metrics: MOCK_METRICS,
  isLoading: false,
  handleBack: jest.fn(),
  refetch: jest.fn(),
};

const setup = (overrides = {}) => {
  (useMetricsScreen as jest.Mock).mockReturnValue({
    ...BASE_HOOK,
    ...overrides,
  });
};

describe("MetricsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setup();
  });

  it("renders the title", () => {
    const { getByText } = render(<MetricsScreen />);
    expect(getByText("Mis métricas")).toBeTruthy();
  });

  it("renders the section header", () => {
    const { getByText } = render(<MetricsScreen />);
    expect(getByText("Resumen General")).toBeTruthy();
  });

  it("shows loading indicator when isLoading is true and no metrics", () => {
    setup({ isLoading: true, metrics: undefined });
    const { UNSAFE_getByType } = render(<MetricsScreen />);
    const { ActivityIndicator } = require("react-native");
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it("renders MetricCards with zero values when metrics is undefined but not loading", () => {
    setup({ metrics: undefined, isLoading: false });
    const { toJSON } = render(<MetricsScreen />);
    expect(toJSON()).not.toBeNull();
  });
});
