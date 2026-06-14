import {
  formatDistance,
  formatPrice,
  getExpiryWarning,
  getPublicationDateLabel,
  STATUS_CHIP_VARIANT,
  STATUS_LABEL,
} from "@/components/ProductCard/utils";

const FIXED_NOW = new Date("2026-06-13T12:00:00.000Z");

describe("STATUS_LABEL", () => {
  it("maps ACTIVE to 'Activa'", () => {
    expect(STATUS_LABEL.ACTIVE).toBe("Activa");
  });

  it("maps RESERVED to 'Reservada'", () => {
    expect(STATUS_LABEL.RESERVED).toBe("Reservada");
  });

  it("maps DELIVERED to 'Entregada'", () => {
    expect(STATUS_LABEL.DELIVERED).toBe("Entregada");
  });

  it("maps CANCELLED to 'Cancelada'", () => {
    expect(STATUS_LABEL.CANCELLED).toBe("Cancelada");
  });

  it("maps EXPIRED to 'Vencida'", () => {
    expect(STATUS_LABEL.EXPIRED).toBe("Vencida");
  });
});

describe("STATUS_CHIP_VARIANT", () => {
  it("maps ACTIVE to primary", () => {
    expect(STATUS_CHIP_VARIANT.ACTIVE).toBe("primary");
  });

  it("maps RESERVED to warning", () => {
    expect(STATUS_CHIP_VARIANT.RESERVED).toBe("warning");
  });

  it("maps DELIVERED to info", () => {
    expect(STATUS_CHIP_VARIANT.DELIVERED).toBe("info");
  });

  it("maps CANCELLED to error", () => {
    expect(STATUS_CHIP_VARIANT.CANCELLED).toBe("error");
  });

  it("maps EXPIRED to error", () => {
    expect(STATUS_CHIP_VARIANT.EXPIRED).toBe("error");
  });
});

describe("formatPrice", () => {
  it("starts with $", () => {
    expect(formatPrice(1500)).toMatch(/^\$/);
  });

  it("formats 0 correctly", () => {
    expect(formatPrice(0)).toBe("$0");
  });
});

describe("formatDistance", () => {
  it("shows meters when km < 1", () => {
    expect(formatDistance(0.3)).toBe("300 m");
  });

  it("shows km with 1 decimal when km >= 1", () => {
    expect(formatDistance(1.5)).toBe("1.5 km");
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

  it("returns null when already expired", () => {
    const past = new Date(FIXED_NOW.getTime() - 1000).toISOString();
    expect(getExpiryWarning(past)).toBeNull();
  });

  it("returns urgent when expiring within 24h", () => {
    const soon = new Date(FIXED_NOW.getTime() + 2 * 3_600_000).toISOString();
    expect(getExpiryWarning(soon)?.level).toBe("urgent");
  });

  it("returns warning when expiring in 24–48h", () => {
    const tomorrow = new Date(
      FIXED_NOW.getTime() + 36 * 3_600_000,
    ).toISOString();
    expect(getExpiryWarning(tomorrow)?.level).toBe("warning");
  });

  it("returns info when expiring in more than 48h", () => {
    const future = new Date(
      FIXED_NOW.getTime() + 10 * 24 * 3_600_000,
    ).toISOString();
    expect(getExpiryWarning(future)?.level).toBe("info");
  });
});

describe("getPublicationDateLabel", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 'Reservada ...' for RESERVED status", () => {
    const result = getPublicationDateLabel(
      "RESERVED",
      "2026-06-12T10:00:00.000Z",
      "2026-06-13T09:00:00.000Z",
    );
    expect(result).toMatch(/^Reservada /);
  });

  it("returns 'Entregada ...' for DELIVERED status", () => {
    const result = getPublicationDateLabel(
      "DELIVERED",
      "2026-06-12T10:00:00.000Z",
      "2026-06-13T09:00:00.000Z",
    );
    expect(result).toMatch(/^Entregada /);
  });

  it("returns 'Cancelada ...' for CANCELLED status", () => {
    const result = getPublicationDateLabel(
      "CANCELLED",
      "2026-06-12T10:00:00.000Z",
      undefined,
    );
    expect(result).toMatch(/^Cancelada /);
  });

  it("returns 'Expirada ...' for EXPIRED status", () => {
    const result = getPublicationDateLabel(
      "EXPIRED",
      "2026-06-12T10:00:00.000Z",
      undefined,
    );
    expect(result).toMatch(/^Expirada /);
  });

  it("returns 'Creada ...' for ACTIVE status using created_at", () => {
    const result = getPublicationDateLabel(
      "ACTIVE",
      "2026-06-13T08:00:00.000Z",
      undefined,
    );
    expect(result).toMatch(/^Creada /);
  });

  it("uses updated_at instead of created_at when provided and status is not ACTIVE", () => {
    const withUpdated = getPublicationDateLabel(
      "RESERVED",
      "2026-06-01T10:00:00.000Z",
      "2026-06-13T09:00:00.000Z",
    );
    const withoutUpdated = getPublicationDateLabel(
      "RESERVED",
      "2026-06-01T10:00:00.000Z",
      undefined,
    );
    expect(withUpdated).not.toBe(withoutUpdated);
  });
});
