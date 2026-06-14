import {
  formatPrice,
  getOrderDateLabel,
  ORDER_STATUS_CHIP_VARIANT,
  ORDER_STATUS_LABEL,
} from "@/components/OrderCard/utils";

const FIXED_NOW = new Date("2026-06-13T12:00:00.000Z");

describe("ORDER_STATUS_LABEL", () => {
  it("maps RESERVED to 'Reservado'", () => {
    expect(ORDER_STATUS_LABEL.RESERVED).toBe("Reservado");
  });

  it("maps DELIVERED to 'Entregado'", () => {
    expect(ORDER_STATUS_LABEL.DELIVERED).toBe("Entregado");
  });

  it("maps CANCELLED to 'Cancelado'", () => {
    expect(ORDER_STATUS_LABEL.CANCELLED).toBe("Cancelado");
  });
});

describe("ORDER_STATUS_CHIP_VARIANT", () => {
  it("maps RESERVED to warning", () => {
    expect(ORDER_STATUS_CHIP_VARIANT.RESERVED).toBe("warning");
  });

  it("maps DELIVERED to info", () => {
    expect(ORDER_STATUS_CHIP_VARIANT.DELIVERED).toBe("info");
  });

  it("maps CANCELLED to error", () => {
    expect(ORDER_STATUS_CHIP_VARIANT.CANCELLED).toBe("error");
  });
});

describe("formatPrice", () => {
  it("prefixes the price with $", () => {
    expect(formatPrice(1000)).toMatch(/^\$/);
  });

  it("formats 0 as $0", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  it("formats large numbers with locale separator", () => {
    const result = formatPrice(10000);
    expect(result).toContain("$");
    expect(result).toContain("10");
  });
});

describe("getOrderDateLabel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 'Entregado ...' when status is DELIVERED", () => {
    const result = getOrderDateLabel(
      "DELIVERED",
      "2026-06-12T10:00:00.000Z",
      "2026-06-13T09:00:00.000Z",
    );
    expect(result).toMatch(/^Entregado /);
  });

  it("returns 'Cancelado ...' when status is CANCELLED", () => {
    const result = getOrderDateLabel(
      "CANCELLED",
      "2026-06-12T10:00:00.000Z",
      "2026-06-13T09:00:00.000Z",
    );
    expect(result).toMatch(/^Cancelado /);
  });

  it("returns 'Pedido ...' using created_at when status is RESERVED", () => {
    const result = getOrderDateLabel(
      "RESERVED",
      "2026-06-13T08:00:00.000Z",
      undefined,
    );
    expect(result).toMatch(/^Pedido /);
  });

  it("falls back to created_at when updated_at is undefined for DELIVERED", () => {
    const result = getOrderDateLabel(
      "DELIVERED",
      "2026-06-13T08:00:00.000Z",
      undefined,
    );
    expect(result).toMatch(/^Entregado /);
  });
});
