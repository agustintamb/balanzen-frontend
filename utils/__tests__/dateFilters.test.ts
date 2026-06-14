import { getDateRange } from "@/utils/dateFilters";

const FIXED_NOW = new Date("2026-06-13T12:00:00.000Z");

describe("getDateRange", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns empty object for 'all' filter", () => {
    expect(getDateRange("all")).toEqual({});
  });

  it("returns today's ISO date range for 'today' filter", () => {
    const result = getDateRange("today");

    expect(result.date_from).toBeDefined();
    expect(result.date_to).toBeDefined();

    const from = new Date(result.date_from!);
    const to = new Date(result.date_to!);

    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
    expect(to.getHours()).toBe(23);
    expect(to.getMinutes()).toBe(59);
    expect(to.getSeconds()).toBe(59);
  });

  it("returns start of current week for 'week' filter (Monday–Sunday)", () => {
    // 2026-06-13 is a Saturday (day = 6)
    const result = getDateRange("week");

    const from = new Date(result.date_from!);
    // Monday 2026-06-08
    expect(from.getUTCFullYear()).toBe(2026);
    expect(from.getUTCMonth()).toBe(5); // June
    expect(from.getUTCDate()).toBe(8);
  });

  it("returns Monday correctly when today is Sunday (day=0)", () => {
    // 2026-06-14 is a Sunday
    jest.setSystemTime(new Date("2026-06-14T12:00:00.000Z"));
    const result = getDateRange("week");

    const from = new Date(result.date_from!);
    // Monday 2026-06-08
    expect(from.getUTCDate()).toBe(8);
  });

  it("returns start of current month for 'month' filter", () => {
    const result = getDateRange("month");

    const from = new Date(result.date_from!);
    expect(from.getUTCFullYear()).toBe(2026);
    expect(from.getUTCMonth()).toBe(5); // June
    expect(from.getUTCDate()).toBe(1);
  });

  it("'today' from date has time set to 00:00:00.000", () => {
    const result = getDateRange("today");
    const from = new Date(result.date_from!);
    // The implementation uses local time setHours
    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
    expect(from.getSeconds()).toBe(0);
    expect(from.getMilliseconds()).toBe(0);
  });

  it("'today' to date has time set to 23:59:59.999", () => {
    const result = getDateRange("today");
    const to = new Date(result.date_to!);
    expect(to.getHours()).toBe(23);
    expect(to.getMinutes()).toBe(59);
    expect(to.getSeconds()).toBe(59);
    expect(to.getMilliseconds()).toBe(999);
  });

  it("returns valid ISO strings for 'week' date_from and date_to", () => {
    const result = getDateRange("week");
    expect(() => new Date(result.date_from!)).not.toThrow();
    expect(() => new Date(result.date_to!)).not.toThrow();
    expect(new Date(result.date_from!).toISOString()).toBe(result.date_from);
    expect(new Date(result.date_to!).toISOString()).toBe(result.date_to);
  });

  it("'month' from is always the 1st at midnight", () => {
    const result = getDateRange("month");
    const from = new Date(result.date_from!);
    expect(from.getDate()).toBe(1);
    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
  });
});
