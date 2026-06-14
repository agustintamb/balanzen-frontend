import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { publicationsService } from "@/api/publications/publications.service";
import {
  CreatePublicationBody,
  MyPublicationsFilters,
  Publication,
  PublicationFilters,
  PublicationListResponse,
  UpdatePublicationBody,
} from "@/api/publications/publications.types";

export const usePublications = (params?: PublicationFilters) =>
  useQuery<PublicationListResponse, Error>({
    queryKey: ["publications", params],
    queryFn: () => publicationsService.list(params),
    staleTime: 1000 * 60 * 2,
  });

/**
 * Listado paginado con scroll infinito. Acumula páginas (limit del backend)
 * a medida que el usuario llega al final de la lista.
 */
export const usePublicationsInfinite = (params?: PublicationFilters) =>
  useInfiniteQuery<PublicationListResponse, Error>({
    queryKey: ["publications", "infinite", params],
    queryFn: ({ pageParam }) =>
      publicationsService.list({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });

export const usePublication = (id: string) =>
  useQuery<Publication, Error>({
    queryKey: ["publications", id],
    queryFn: () => publicationsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });

export const useMyPublications = (params?: MyPublicationsFilters) =>
  useQuery<PublicationListResponse, Error>({
    queryKey: ["publications", "me", params],
    queryFn: () => publicationsService.getMyPublications(params),
    staleTime: 1000 * 60 * 2,
  });

export const useCreatePublication = () => {
  const queryClient = useQueryClient();
  return useMutation<Publication, Error, CreatePublicationBody>({
    mutationFn: publicationsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
};

export const useUpdatePublication = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Publication,
    Error,
    { id: string; body: UpdatePublicationBody }
  >({
    mutationFn: ({ id, body }) => publicationsService.update(id, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(["publications", updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ["publications", "me"] });
    },
  });
};

export const useDeletePublication = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: publicationsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications"] });
    },
  });
};
