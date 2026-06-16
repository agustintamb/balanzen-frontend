import { render } from "@testing-library/react-native";
import type { Publication } from "@/api/publications/publications.types";
import DetailBody from "../DetailBody";

const inHours = (h: number) =>
  new Date(Date.now() + h * 3_600_000).toISOString();

const buildPublication = (overrides: Partial<Publication> = {}): Publication =>
  ({
    title: "Mix de Verduras",
    description: "Frescas",
    original_price: 2400,
    final_price: 1200,
    discount_pct: 50,
    is_donation: false,
    status: "ACTIVE",
    category: { id: "c", name: "Verduras" },
    expiry_date: inHours(5),
    ...overrides,
  }) as Publication;

describe("DetailBody", () => {
  it("renders title, category chip, discount price and savings", () => {
    const { getByText } = render(
      <DetailBody publication={buildPublication()} />,
    );
    expect(getByText("Mix de Verduras")).toBeTruthy();
    expect(getByText("Verduras")).toBeTruthy();
    expect(getByText("$1.200")).toBeTruthy();
    expect(getByText("$2.400")).toBeTruthy();
    expect(getByText("Ahorrás $1.200")).toBeTruthy();
  });

  it("renders 'Gratis' for a donation", () => {
    const { getByText } = render(
      <DetailBody
        publication={buildPublication({
          is_donation: true,
          discount_pct: 100,
          final_price: 2400,
        })}
      />,
    );
    expect(getByText("Gratis")).toBeTruthy();
  });

  it("omits description when empty", () => {
    const { queryByText } = render(
      <DetailBody publication={buildPublication({ description: "" })} />,
    );
    expect(queryByText("Frescas")).toBeNull();
  });

  it("shows an urgent expiry label", () => {
    const { getByText } = render(
      <DetailBody
        publication={buildPublication({ expiry_date: inHours(1) })}
      />,
    );
    expect(getByText("Vence hoy")).toBeTruthy();
  });

  it("shows a warning expiry label", () => {
    const { getByText } = render(
      <DetailBody
        publication={buildPublication({ expiry_date: inHours(36) })}
      />,
    );
    expect(getByText("Vence mañana")).toBeTruthy();
  });

  it("hides the expiry line when already expired", () => {
    const { queryByText } = render(
      <DetailBody
        publication={buildPublication({ expiry_date: inHours(-2) })}
      />,
    );
    expect(queryByText(/Vence/)).toBeNull();
  });
});
