import type { Order } from "@/api/orders/orders.types";
import { getDateRange } from "@/utils/dateFilters";
import { sortAndSearchOrders as globalSortAndSearchOrders } from "@/utils/orders";
import { buildOrderFilterParams, sortAndSearchOrders } from "../utils";

jest.mock("@/utils/dateFilters");
jest.mock("@/utils/orders");

const mockGetDateRange = getDateRange as jest.MockedFunction<typeof getDateRange>;
const mockGlobalSortAndSearchOrders = globalSortAndSearchOrders as jest.MockedFunction<
  typeof globalSortAndSearchOrders
>;

describe("buildOrderFilterParams", () => {
  const mockDateRange = { from: "2024-01-01", to: "2024-01-31" };

  beforeEach(() => {
    mockGetDateRange.mockReturnValue(mockDateRange);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not include status key when activeFilter is "all"', () => {
    const result = buildOrderFilterParams("all", "month");
    expect(result).not.toHaveProperty("status");
  });

  it("merges dateRange into result when activeFilter is all", () => {
    const result = buildOrderFilterParams("all", "month");
    expect(result).toEqual(mockDateRange);
  });

  it("includes status key when activeFilter is PENDING", () => {
    const result = buildOrderFilterParams("PENDING", "week");
    expect(result).toHaveProperty("status", "PENDING");
  });

  it("includes status key when activeFilter is RESERVED", () => {
    const result = buildOrderFilterParams("RESERVED", "today");
    expect(result).toHaveProperty("status", "RESERVED");
  });

  it("includes status key when activeFilter is COMPLETED", () => {
    const result = buildOrderFilterParams("COMPLETED", "all");
    expect(result).toHaveProperty("status", "COMPLETED");
  });

  it("includes status key when activeFilter is CANCELLED", () => {
    const result = buildOrderFilterParams("CANCELLED", "all");
    expect(result).toHaveProperty("status", "CANCELLED");
  });

  it("merges dateRange with status when activeFilter is not all", () => {
    const result = buildOrderFilterParams("PENDING", "week");
    expect(result).toEqual({ status: "PENDING", ...mockDateRange });
  });

  it("calls getDateRange with the provided dateFilter", () => {
    buildOrderFilterParams("all", "today");
    expect(mockGetDateRange).toHaveBeenCalledWith("today");
  });
});

describe("sortAndSearchOrders", () => {
  const mockOrders: Order[] = [{ id: "1" } as Order, { id: "2" } as Order];
  const mockResult: Order[] = [{ id: "2" } as Order];

  beforeEach(() => {
    mockGlobalSortAndSearchOrders.mockReturnValue(mockResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("delegates to globalSortAndSearchOrders with correct arguments", () => {
    sortAndSearchOrders(mockOrders, "recent", "query");
    expect(mockGlobalSortAndSearchOrders).toHaveBeenCalledWith(
      mockOrders,
      "recent",
      "query",
    );
  });

  it("returns the result from globalSortAndSearchOrders", () => {
    const result = sortAndSearchOrders(mockOrders, "recent", "query");
    expect(result).toBe(mockResult);
  });

  it("delegates with oldest sort and empty search", () => {
    sortAndSearchOrders(mockOrders, "oldest", "");
    expect(mockGlobalSortAndSearchOrders).toHaveBeenCalledWith(
      mockOrders,
      "oldest",
      "",
    );
  });

  it("handles undefined orders", () => {
    sortAndSearchOrders(undefined, "recent", "");
    expect(mockGlobalSortAndSearchOrders).toHaveBeenCalledWith(
      undefined,
      "recent",
      "",
    );
  });
});
