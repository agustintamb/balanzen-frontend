import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native/pure";
import React from "react";

import { categoriesService } from "@/api/categories/categories.service";
import { Category, CategoryListResponse } from "@/api/categories/categories.types";
import { useCategories } from "@/hooks/useCategories";

jest.mock("@/api/categories/categories.service", () => ({
  categoriesService: {
    list: jest.fn(),
  },
}));

const mockCategoriesService = categoriesService as jest.Mocked<typeof categoriesService>;

const buildCategory = (overrides?: Partial<Category>): Category => ({
  id: "cat-uuid-1",
  name: "Panadería",
  ...overrides,
});

const buildCategoryListResponse = (categories: Category[]): CategoryListResponse => ({
  categories,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return wrapper;
};

describe("useCategories", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should start in loading state before the query resolves", () => {
    mockCategoriesService.list.mockResolvedValueOnce(buildCategoryListResponse([]));

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("should return the categories array (unwrapped from categories key) on success", async () => {
    const categories = [
      buildCategory({ id: "cat-1", name: "Panadería" }),
      buildCategory({ id: "cat-2", name: "Lácteos" }),
    ];
    mockCategoriesService.list.mockResolvedValueOnce(buildCategoryListResponse(categories));

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(categories);
    expect(result.current.data).toHaveLength(2);
  });

  it("should return an empty array when the API returns no categories", async () => {
    mockCategoriesService.list.mockResolvedValueOnce(buildCategoryListResponse([]));

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
    expect(result.current.data).toHaveLength(0);
  });

  it("should call categoriesService.list with no arguments", async () => {
    mockCategoriesService.list.mockResolvedValueOnce(buildCategoryListResponse([]));

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockCategoriesService.list).toHaveBeenCalledTimes(1);
    expect(mockCategoriesService.list).toHaveBeenCalledWith();
  });

  it("should expose each category with id and name fields", async () => {
    const categories = [
      buildCategory({ id: "uuid-abc", name: "Verduras" }),
      buildCategory({ id: "uuid-def", name: "Frutas" }),
      buildCategory({ id: "uuid-ghi", name: "Carnes" }),
    ];
    mockCategoriesService.list.mockResolvedValueOnce(buildCategoryListResponse(categories));

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0]).toEqual({ id: "uuid-abc", name: "Verduras" });
    expect(result.current.data?.[1]).toEqual({ id: "uuid-def", name: "Frutas" });
    expect(result.current.data?.[2]).toEqual({ id: "uuid-ghi", name: "Carnes" });
  });

  it("should set isError and expose the error when the service fails", async () => {
    const networkError = new Error("Network Error");
    mockCategoriesService.list.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Network Error");
    expect(result.current.data).toBeUndefined();
  });

  it("should set isError when a 401 unauthorized error is thrown", async () => {
    const unauthorizedError = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
    });
    mockCategoriesService.list.mockRejectedValueOnce(unauthorizedError);

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Unauthorized");
  });

  it("should use query key ['categories'] so multiple instances share cache", async () => {
    const categories = [buildCategory()];
    // Provide enough mock responses in case concurrent hooks both fire before dedup
    mockCategoriesService.list
      .mockResolvedValueOnce(buildCategoryListResponse(categories))
      .mockResolvedValueOnce(buildCategoryListResponse(categories));

    const wrapper = createWrapper();

    const { result: first } = renderHook(() => useCategories(), { wrapper });
    const { result: second } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => expect(first.current.isSuccess).toBe(true));
    await waitFor(() => expect(second.current.isSuccess).toBe(true));

    // Both hooks resolve to identical data from the same query key
    expect(first.current.data).toEqual(second.current.data);
    expect(first.current.data).toEqual(categories);
  });

  it("should handle a large list of categories without errors", async () => {
    const manyCategories = Array.from({ length: 50 }, (_, i) =>
      buildCategory({ id: `cat-${i}`, name: `Category ${i}` })
    );
    mockCategoriesService.list.mockResolvedValueOnce(
      buildCategoryListResponse(manyCategories)
    );

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(50);
    expect(result.current.data?.[49]).toEqual({ id: "cat-49", name: "Category 49" });
  });

  it("should return data as a plain Category array, not wrapped in CategoryListResponse", async () => {
    const categories = [buildCategory({ id: "cat-1", name: "Bebidas" })];
    mockCategoriesService.list.mockResolvedValueOnce(buildCategoryListResponse(categories));

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data).not.toHaveProperty("categories");
  });
});
