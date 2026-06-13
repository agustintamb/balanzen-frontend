import {
  formatCurrency,
  formatExpiry,
  formatPrice,
  formatTimeAgo,
} from "@/utils/format";

// Fix current date at 2026-01-15 12:00:00 UTC for all date-relative tests
const FIXED_NOW = new Date("2026-01-15T12:00:00.000Z");

describe("formatCurrency", () => {
  it("returns a string containing the $ symbol", () => {
    expect(formatCurrency(1000)).toContain("$");
  });

  it("does not contain the ARS literal in the output", () => {
    expect(formatCurrency(1000)).not.toContain("ARS");
  });

  it("formats zero without decimal places", () => {
    const result = formatCurrency(0);
    expect(result).toContain("$");
    expect(result).not.toMatch(/\.\d{2}/);
  });

  it("formats a large number", () => {
    const result = formatCurrency(10000);
    expect(result).toContain("$");
    expect(result).toContain("10");
  });
});

describe("formatPrice", () => {
  it("starts with the $ sign", () => {
    expect(formatPrice(1000)).toMatch(/^\$/);
  });

  it("rounds fractional values", () => {
    expect(formatPrice(1000.9)).toContain("1.001");
  });

  it("formats 0 as $0", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});

describe("formatExpiry", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 'Vencido' for a past date", () => {
    expect(formatExpiry("2026-01-14")).toBe("Vencido");
  });

  it("returns 'Vence hoy' for today", () => {
    expect(formatExpiry("2026-01-15")).toBe("Vence hoy");
  });

  it("returns 'Vence mañana' for tomorrow", () => {
    expect(formatExpiry("2026-01-16")).toBe("Vence mañana");
  });

  it("returns days remaining for future dates", () => {
    expect(formatExpiry("2026-01-20")).toBe("Vence en 5 días");
  });
});

describe("formatTimeAgo", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 'Ahora' for under 1 minute ago", () => {
    const recent = new Date(FIXED_NOW.getTime() - 30_000).toISOString();
    expect(formatTimeAgo(recent)).toBe("Ahora");
  });

  it("returns minutes for under 1 hour ago", () => {
    const past = new Date(FIXED_NOW.getTime() - 30 * 60_000).toISOString();
    expect(formatTimeAgo(past)).toBe("Hace 30 min");
  });

  it("returns singular hour for exactly 1 hour ago", () => {
    const past = new Date(FIXED_NOW.getTime() - 60 * 60_000).toISOString();
    expect(formatTimeAgo(past)).toBe("Hace 1 hora");
  });

  it("returns plural hours for multiple hours ago", () => {
    const past = new Date(FIXED_NOW.getTime() - 3 * 60 * 60_000).toISOString();
    expect(formatTimeAgo(past)).toBe("Hace 3 horas");
  });

  it("returns 'Ayer' for exactly 1 day ago", () => {
    const past = new Date(FIXED_NOW.getTime() - 24 * 60 * 60_000).toISOString();
    expect(formatTimeAgo(past)).toBe("Ayer");
  });

  it("returns days for 2–6 days ago", () => {
    const past = new Date(
      FIXED_NOW.getTime() - 3 * 24 * 60 * 60_000,
    ).toISOString();
    expect(formatTimeAgo(past)).toBe("Hace 3 días");
  });

  it("returns a localized date string for 7 or more days ago", () => {
    const past = new Date(
      FIXED_NOW.getTime() - 14 * 24 * 60 * 60_000,
    ).toISOString();
    const result = formatTimeAgo(past);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain("Hace");
    expect(result).not.toBe("Ayer");
  });
});
