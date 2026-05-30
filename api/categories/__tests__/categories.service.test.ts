import { categoriesService } from "@/api/categories/categories.service";
import { CategoryListResponse } from "@/api/categories/categories.types";

const mockGet = jest.fn();

jest.mock("@/api/client", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

describe("categoriesService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should call GET /categories with no params", async () => {
      const mockResponse: CategoryListResponse = { categories: [] };
      mockGet.mockResolvedValueOnce(mockResponse);

      await categoriesService.list();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/categories");
    });

    it("should return a CategoryListResponse with categories array", async () => {
      const mockResponse: CategoryListResponse = {
        categories: [
          { id: "cat-1", name: "Panadería" },
          { id: "cat-2", name: "Lácteos" },
        ],
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await categoriesService.list();

      expect(result).toEqual(mockResponse);
      expect(result.categories).toHaveLength(2);
    });

    it("should return an empty categories array when no categories exist", async () => {
      const mockResponse: CategoryListResponse = { categories: [] };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await categoriesService.list();

      expect(result.categories).toHaveLength(0);
      expect(result.categories).toEqual([]);
    });

    it("should return a single category correctly", async () => {
      const mockResponse: CategoryListResponse = {
        categories: [{ id: "cat-1", name: "Panadería" }],
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await categoriesService.list();

      expect(result.categories[0]).toEqual({ id: "cat-1", name: "Panadería" });
    });

    it("should propagate errors thrown by the API client", async () => {
      const networkError = new Error("Network Error");
      mockGet.mockRejectedValueOnce(networkError);

      await expect(categoriesService.list()).rejects.toThrow("Network Error");
    });

    it("should propagate a 401 unauthorized error from the API client", async () => {
      const unauthorizedError = Object.assign(new Error("Unauthorized"), {
        response: { status: 401 },
      });
      mockGet.mockRejectedValueOnce(unauthorizedError);

      await expect(categoriesService.list()).rejects.toMatchObject({
        message: "Unauthorized",
      });
    });

    it("should propagate a 500 server error from the API client", async () => {
      const serverError = Object.assign(new Error("Internal Server Error"), {
        response: { status: 500 },
      });
      mockGet.mockRejectedValueOnce(serverError);

      await expect(categoriesService.list()).rejects.toMatchObject({
        response: { status: 500 },
      });
    });

    it("should return the exact value resolved by the API client", async () => {
      const mockResponse: CategoryListResponse = {
        categories: [
          { id: "uuid-abc", name: "Verduras" },
          { id: "uuid-def", name: "Frutas" },
          { id: "uuid-ghi", name: "Carnes" },
        ],
      };
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await categoriesService.list();

      expect(result).toBe(mockResponse);
    });

    it("should not pass additional arguments to GET /categories", async () => {
      mockGet.mockResolvedValueOnce({ categories: [] });

      await categoriesService.list();

      const [url, options] = mockGet.mock.calls[0];
      expect(url).toBe("/categories");
      expect(options).toBeUndefined();
    });
  });
});
