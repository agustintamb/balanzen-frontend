import {
  formatDistance,
  formatPrice,
  getExpiryWarning,
} from "@/components/ConsumerPublicationCard/utils";

const FIXED_NOW = new Date("2026-06-13T12:00:00.000Z");

describe("formatPrice", () => {
  it("prefixes with $", () => {
    expect(formatPrice(500)).toMatch(/^\$/);
  });

  it("formats 0 as $0", () => {
    expect(formatPrice(0)).toBe("$0");
  });

  it("formats large numbers", () => {
    expect(formatPrice(10000)).toContain("$");
  });
});

describe("formatDistance", () => {
  it("shows meters for distances under 1 km", () => {
    expect(formatDistance(0.5)).toBe("500 m");
  });

  it("shows km for distances >= 1 km", () => {
    expect(formatDistance(2.5)).toBe("2.5 km");
  });

  it("rounds meters to the nearest integer", () => {
    expect(formatDistance(0.756)).toBe("756 m");
  });

  it("shows exactly 1 decimal for km", () => {
    expect(formatDistance(1.0)).toBe("1.0 km");
  });

  it("shows exactly 1 decimal for km with long decimal", () => {
    expect(formatDistance(3.14159)).toBe("3.1 km");
  });
});

describe("getExpiryWarning", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns null when expiry has already passed", () => {
    const past = new Date(FIXED_NOW.getTime() - 3_600_000).toISOString();
    expect(getExpiryWarning(past)).toBeNull();
  });

  it("returns urgent level when expiry is within 24 hours", () => {
    const soon = new Date(FIXED_NOW.getTime() + 12 * 3_600_000).toISOString();
    const result = getExpiryWarning(soon);
    expect(result?.level).toBe("urgent");
    expect(result?.label).toBe("Vence hoy");
  });

  it("returns warning level when expiry is between 24 and 48 hours", () => {
    const tomorrow = new Date(
      FIXED_NOW.getTime() + 30 * 3_600_000,
    ).toISOString();
    const result = getExpiryWarning(tomorrow);
    expect(result?.level).toBe("warning");
    expect(result?.label).toBe("Vence mañana");
  });

  it("returns info level with days count when expiry is beyond 48 hours", () => {
    const future = new Date(
      FIXED_NOW.getTime() + 5 * 24 * 3_600_000,
    ).toISOString();
    const result = getExpiryWarning(future);
    expect(result?.level).toBe("info");
    expect(result?.label).toMatch(/Vence en \d+ días/);
  });
});
