import { render } from "@testing-library/react-native";
import { View } from "react-native";
import ProductDetailLayout from "../ProductDetailLayout";
import type { Publication } from "@/api/publications/publications.types";

jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("../DetailImageCarousel", () => {
  const { View } = require("react-native");
  return () => <View testID="carousel" />;
});
jest.mock("../DetailBody", () => {
  const { View } = require("react-native");
  return () => <View testID="detail-body" />;
});
jest.mock("../DetailInfoCard", () => {
  const { View } = require("react-native");
  return () => <View testID="detail-info-card" />;
});
jest.mock("@/components/ui/AppRefreshControl", () => {
  const { View } = require("react-native");
  return () => <View />;
});

const pub = {
  id: "p1",
  title: "Verduras",
  description: "...",
  original_price: 1000,
  final_price: 500,
  discount_pct: 50,
  expiry_date: "2026-12-31",
  category: { id: "c1", name: "Verduras" },
  photos: ["https://img/1.jpg"],
  status: "ACTIVE",
  is_donation: false,
  commerce: {
    id: "cm1",
    business_name: "Natura",
    selected_address: { formatted_address: "Av 1", lat: 0, lng: 0 },
  },
  created_at: "2026-01-01",
} as unknown as Publication;

const baseProps = {
  publication: pub,
  onBack: jest.fn(),
  isRefreshing: false,
  onRefresh: jest.fn(),
  counterpart: <View testID="counterpart-slot" />,
  infoItems: [],
};

describe("ProductDetailLayout", () => {
  it("renders the counterpart slot", () => {
    const { getByTestId } = render(<ProductDetailLayout {...baseProps} />);
    expect(getByTestId("counterpart-slot")).toBeTruthy();
  });

  it("renders footer when provided", () => {
    const { getByTestId } = render(
      <ProductDetailLayout
        {...baseProps}
        footer={<View testID="footer-slot" />}
      />,
    );
    expect(getByTestId("footer-slot")).toBeTruthy();
  });

  it("renders children when provided", () => {
    const { getByTestId } = render(
      <ProductDetailLayout {...baseProps}>
        <View testID="children-slot" />
      </ProductDetailLayout>,
    );
    expect(getByTestId("children-slot")).toBeTruthy();
  });

  it("does not render footer when not provided", () => {
    const { queryByTestId } = render(
      <ProductDetailLayout {...baseProps} />,
    );
    expect(queryByTestId("footer-slot")).toBeNull();
  });
});
