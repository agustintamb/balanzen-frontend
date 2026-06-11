import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/api/categories/categories.service";
import { Category } from "@/api/categories/categories.types";

export const useCategories = () =>
  useQuery<Category[], Error>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoriesService.list();
      return res.categories;
    },
    staleTime: 1000 * 60 * 60,
  });
