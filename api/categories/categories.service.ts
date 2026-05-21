import apiClient from "@/api/client";
import { CategoryListResponse } from "@/api/categories/categories.types";

export const categoriesService = {
  list: (): Promise<CategoryListResponse> => apiClient.get("/categories"),
};
