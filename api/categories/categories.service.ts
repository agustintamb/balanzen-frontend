import { CategoryListResponse } from "@/api/categories/categories.types";
import apiClient from "@/api/client";

export const categoriesService = {
  list: (): Promise<CategoryListResponse> => apiClient.get("/categories"),
};
