import { renderHook, waitFor } from "@testing-library/react-native/pure";

import createWrapper from "@/__test-utils__/createWrapper";
import {
  useCreatePublication,
  useDeletePublication,
  useMyPublications,
  usePublication,
  usePublications,
  useUpdatePublication,
} from "@/hooks/usePublications";
import {
  CreatePublicationBody,
  MyPublicationsFilters,
  Publication,
  PublicationFilters,
  PublicationListResponse,
  UpdatePublicationBody,
} from "@/api/publications/publications.types";

const mockList = jest.fn();
const mockGetById = jest.fn();
const mockGetMyPublications = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/api/publications/publications.service", () => ({
  publicationsService: {
    list: (...args: unknown[]) => mockList(...args),
    getById: (...args: unknown[]) => mockGetById(...args),
    getMyPublications: (...args: unknown[]) => mockGetMyPublications(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

const buildPublication = (overrides: Partial<Publication> = {}): Publication => ({
  id: "pub-1",
  title: "Pan integral",
  description: "Pan artesanal de ayer",
  original_price: 500,
  final_price: 250,
  discount_pct: 50,
  expiry_date: "2026-05-31",
  category: { id: "cat-1", name: "Panadería" },
  photos: ["https://cdn.example.com/photo1.jpg"],
  status: "ACTIVE",
  is_donation: false,
  commerce: {
    id: "commerce-1",
    business_name: "La Panadería",
    selected_address: {
      formatted_address: "Av. Corrientes 1234",
      lat: -34.6037,
      lng: -58.3816,
    },
  },
  created_at: "2026-05-01T10:00:00Z",
  ...overrides,
});

const buildPublicationListResponse = (
  overrides: Partial<PublicationListResponse> = {},
): PublicationListResponse => ({
  publications: [buildPublication()],
  pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
  ...overrides,
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("usePublications", () => {
  describe("successful fetch", () => {
    it("should return publication list when query resolves", async () => {
      const response = buildPublicationListResponse();
      mockList.mockResolvedValueOnce(response);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublications(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(response);
    });

    it("should call publicationsService.list with no params when invoked without arguments", async () => {
      mockList.mockResolvedValueOnce(buildPublicationListResponse());
      const { wrapper } = createWrapper();

      renderHook(() => usePublications(), { wrapper });

      await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));
      expect(mockList).toHaveBeenCalledWith(undefined);
    });

    it("should pass all provided filters to publicationsService.list", async () => {
      const filters: PublicationFilters = {
        page: 2,
        limit: 5,
        category_id: "cat-1",
        min_discount: 20,
        sort_by: "discount_pct",
        sort_order: "desc",
        lat: -34.6037,
        lng: -58.3816,
        radius_km: 5,
        donation: false,
        search: "pan",
      };
      mockList.mockResolvedValueOnce(buildPublicationListResponse());
      const { wrapper } = createWrapper();

      renderHook(() => usePublications(filters), { wrapper });

      await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));
      expect(mockList).toHaveBeenCalledWith(filters);
    });

    it("should return an empty publications array when API returns no results", async () => {
      const emptyResponse = buildPublicationListResponse({
        publications: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
      });
      mockList.mockResolvedValueOnce(emptyResponse);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublications({ search: "nonexistent" }), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.publications).toHaveLength(0);
    });

    it("should use the correct query key including provided params", async () => {
      const filters: PublicationFilters = { category_id: "cat-2" };
      mockList.mockResolvedValueOnce(buildPublicationListResponse());
      const { wrapper, queryClient } = createWrapper();

      renderHook(() => usePublications(filters), { wrapper });

      await waitFor(() => expect(mockList).toHaveBeenCalledTimes(1));
      const cachedData = queryClient.getQueryData(["publications", filters]);
      expect(cachedData).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should expose isError true when the API call fails", async () => {
      mockList.mockRejectedValueOnce(new Error("Network Error"));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublications(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Network Error");
    });
  });

  describe("loading state", () => {
    it("should start in loading state before the query resolves", () => {
      mockList.mockReturnValue(new Promise(() => {}));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublications(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });
  });
});

describe("usePublication", () => {
  describe("successful fetch", () => {
    it("should return a single publication when query resolves", async () => {
      const pub = buildPublication({ id: "pub-abc", title: "Medialunas" });
      mockGetById.mockResolvedValueOnce(pub);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublication("pub-abc"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(pub);
    });

    it("should call publicationsService.getById with the provided id", async () => {
      mockGetById.mockResolvedValueOnce(buildPublication({ id: "pub-xyz" }));
      const { wrapper } = createWrapper();

      renderHook(() => usePublication("pub-xyz"), { wrapper });

      await waitFor(() => expect(mockGetById).toHaveBeenCalledTimes(1));
      expect(mockGetById).toHaveBeenCalledWith("pub-xyz");
    });

    it("should use the correct query key with the given id", async () => {
      mockGetById.mockResolvedValueOnce(buildPublication({ id: "pub-1" }));
      const { wrapper, queryClient } = createWrapper();

      renderHook(() => usePublication("pub-1"), { wrapper });

      await waitFor(() => expect(mockGetById).toHaveBeenCalledTimes(1));
      const cachedData = queryClient.getQueryData(["publications", "pub-1"]);
      expect(cachedData).toBeDefined();
    });
  });

  describe("disabled when id is falsy", () => {
    it("should not call publicationsService.getById when id is an empty string", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublication(""), { wrapper });

      expect(mockGetById).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe("idle");
    });

    it("should have status idle when id is empty string", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublication(""), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should expose isError true when API returns a 404", async () => {
      const notFoundError = Object.assign(new Error("Not Found"), {
        response: { status: 404 },
      });
      mockGetById.mockRejectedValueOnce(notFoundError);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublication("bad-id"), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});

describe("useMyPublications", () => {
  describe("successful fetch", () => {
    it("should return my publications list when query resolves", async () => {
      const response = buildPublicationListResponse({
        publications: [buildPublication({ id: "my-pub-1" })],
      });
      mockGetMyPublications.mockResolvedValueOnce(response);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useMyPublications(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(response);
    });

    it("should call publicationsService.getMyPublications with no params when invoked without arguments", async () => {
      mockGetMyPublications.mockResolvedValueOnce(buildPublicationListResponse());
      const { wrapper } = createWrapper();

      renderHook(() => useMyPublications(), { wrapper });

      await waitFor(() => expect(mockGetMyPublications).toHaveBeenCalledTimes(1));
      expect(mockGetMyPublications).toHaveBeenCalledWith(undefined);
    });

    it("should pass status filter to publicationsService.getMyPublications", async () => {
      const filters: MyPublicationsFilters = { status: "ACTIVE" };
      mockGetMyPublications.mockResolvedValueOnce(buildPublicationListResponse());
      const { wrapper } = createWrapper();

      renderHook(() => useMyPublications(filters), { wrapper });

      await waitFor(() => expect(mockGetMyPublications).toHaveBeenCalledTimes(1));
      expect(mockGetMyPublications).toHaveBeenCalledWith(filters);
    });

    it("should pass pagination params to publicationsService.getMyPublications", async () => {
      const filters: MyPublicationsFilters = { page: 2, limit: 5 };
      mockGetMyPublications.mockResolvedValueOnce(buildPublicationListResponse());
      const { wrapper } = createWrapper();

      renderHook(() => useMyPublications(filters), { wrapper });

      await waitFor(() => expect(mockGetMyPublications).toHaveBeenCalledTimes(1));
      expect(mockGetMyPublications).toHaveBeenCalledWith(filters);
    });

    it("should use the correct query key including me segment and params", async () => {
      const filters: MyPublicationsFilters = { status: "EXPIRED" };
      mockGetMyPublications.mockResolvedValueOnce(buildPublicationListResponse());
      const { wrapper, queryClient } = createWrapper();

      renderHook(() => useMyPublications(filters), { wrapper });

      await waitFor(() => expect(mockGetMyPublications).toHaveBeenCalledTimes(1));
      const cachedData = queryClient.getQueryData(["publications", "me", filters]);
      expect(cachedData).toBeDefined();
    });

    it("should return publications with different statuses correctly", async () => {
      const response = buildPublicationListResponse({
        publications: [
          buildPublication({ id: "p1", status: "ACTIVE" }),
          buildPublication({ id: "p2", status: "EXPIRED" }),
          buildPublication({ id: "p3", status: "RESERVED" }),
        ],
      });
      mockGetMyPublications.mockResolvedValueOnce(response);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useMyPublications(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.publications).toHaveLength(3);
    });
  });

  describe("error handling", () => {
    it("should expose isError true when the API call fails", async () => {
      mockGetMyPublications.mockRejectedValueOnce(new Error("Forbidden"));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useMyPublications(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Forbidden");
    });
  });
});

describe("useCreatePublication", () => {
  const buildCreateBody = (
    overrides: Partial<CreatePublicationBody> = {},
  ): CreatePublicationBody => ({
    title: "Facturas",
    description: "Facturas de grasa de hoy",
    original_price: 600,
    final_price: 300,
    expiry_date: "2026-05-31",
    category_id: "cat-1",
    photos: ["https://cdn.example.com/facturas.jpg"],
    ...overrides,
  });

  describe("successful mutation", () => {
    it("should call publicationsService.create with the provided body", async () => {
      const body = buildCreateBody();
      const created = buildPublication();
      mockCreate.mockResolvedValueOnce(created);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreatePublication(), { wrapper });
      result.current.mutate(body);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate.mock.calls[0][0]).toEqual(body);
    });

    it("should return the created publication as mutation data", async () => {
      const body = buildCreateBody({ title: "Croissants" });
      const created = buildPublication({ title: "Croissants" });
      mockCreate.mockResolvedValueOnce(created);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreatePublication(), { wrapper });
      result.current.mutate(body);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.title).toBe("Croissants");
    });

    it("should invalidate publications queries on success", async () => {
      const body = buildCreateBody();
      mockCreate.mockResolvedValueOnce(buildPublication());
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreatePublication(), { wrapper });
      result.current.mutate(body);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["publications"] });
    });

    it("should handle a donation publication body correctly", async () => {
      const body = buildCreateBody({ original_price: 400, final_price: 0 });
      mockCreate.mockResolvedValueOnce(buildPublication({ is_donation: true, final_price: 0 }));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreatePublication(), { wrapper });
      result.current.mutate(body);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockCreate.mock.calls[0][0]).toMatchObject({ final_price: 0 });
    });
  });

  describe("error handling", () => {
    it("should expose isError true when publicationsService.create rejects", async () => {
      mockCreate.mockRejectedValueOnce(new Error("Validation error"));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreatePublication(), { wrapper });
      result.current.mutate(buildCreateBody());

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Validation error");
    });
  });

  describe("initial state", () => {
    it("should start in idle state before any mutation is triggered", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useCreatePublication(), { wrapper });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});

describe("useUpdatePublication", () => {
  const buildUpdateBody = (
    overrides: Partial<UpdatePublicationBody> = {},
  ): UpdatePublicationBody => ({
    title: "Pan actualizado",
    final_price: 200,
    ...overrides,
  });

  describe("successful mutation", () => {
    it("should call publicationsService.update with id and body", async () => {
      const body = buildUpdateBody();
      const updated = buildPublication({ id: "pub-xyz", title: "Pan actualizado" });
      mockUpdate.mockResolvedValueOnce(updated);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdatePublication(), { wrapper });
      result.current.mutate({ id: "pub-xyz", body });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith("pub-xyz", body);
    });

    it("should return the updated publication as mutation data", async () => {
      const updated = buildPublication({ id: "pub-1", final_price: 150 });
      mockUpdate.mockResolvedValueOnce(updated);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdatePublication(), { wrapper });
      result.current.mutate({ id: "pub-1", body: { final_price: 150 } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.final_price).toBe(150);
    });

    it("should set updated publication data in the cache on success", async () => {
      const updated = buildPublication({ id: "pub-cache-1", title: "Cached title" });
      mockUpdate.mockResolvedValueOnce(updated);
      const { wrapper, queryClient } = createWrapper();
      const setQueryDataSpy = jest.spyOn(queryClient, "setQueryData");

      const { result } = renderHook(() => useUpdatePublication(), { wrapper });
      result.current.mutate({ id: "pub-cache-1", body: { title: "Cached title" } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ["publications", "pub-cache-1"],
        updated,
      );
    });

    it("should invalidate publications/me queries on success", async () => {
      const updated = buildPublication({ id: "pub-1" });
      mockUpdate.mockResolvedValueOnce(updated);
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdatePublication(), { wrapper });
      result.current.mutate({ id: "pub-1", body: {} });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["publications", "me"] });
    });

    it("should pass a partial body with only the fields being updated", async () => {
      const partialBody: UpdatePublicationBody = { expiry_date: "2026-06-15" };
      mockUpdate.mockResolvedValueOnce(buildPublication({ id: "pub-2" }));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdatePublication(), { wrapper });
      result.current.mutate({ id: "pub-2", body: partialBody });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockUpdate).toHaveBeenCalledWith("pub-2", partialBody);
    });
  });

  describe("error handling", () => {
    it("should expose isError true when publicationsService.update rejects", async () => {
      mockUpdate.mockRejectedValueOnce(new Error("Not Found"));
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdatePublication(), { wrapper });
      result.current.mutate({ id: "bad-id", body: {} });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Not Found");
    });
  });

  describe("initial state", () => {
    it("should start in idle state before any mutation is triggered", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdatePublication(), { wrapper });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});

describe("useDeletePublication", () => {
  describe("successful mutation", () => {
    it("should call publicationsService.delete with the provided id", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeletePublication(), { wrapper });
      result.current.mutate("pub-del-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete.mock.calls[0][0]).toBe("pub-del-1");
    });

    it("should resolve with undefined on successful deletion", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeletePublication(), { wrapper });
      result.current.mutate("pub-del-1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBeUndefined();
    });

    it("should invalidate publications queries on success", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useDeletePublication(), { wrapper });
      result.current.mutate("pub-del-2");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["publications"] });
    });

    it("should correctly pass different id values to publicationsService.delete", async () => {
      mockDelete.mockResolvedValueOnce(undefined);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeletePublication(), { wrapper });
      result.current.mutate("uuid-del-9999");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockDelete.mock.calls[0][0]).toBe("uuid-del-9999");
    });
  });

  describe("error handling", () => {
    it("should expose isError true when publicationsService.delete returns 404", async () => {
      const notFoundError = Object.assign(new Error("Not Found"), {
        response: { status: 404 },
      });
      mockDelete.mockRejectedValueOnce(notFoundError);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeletePublication(), { wrapper });
      result.current.mutate("nonexistent-pub");

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should expose isError true when publicationsService.delete returns 403", async () => {
      const forbiddenError = Object.assign(new Error("Forbidden"), {
        response: { status: 403 },
      });
      mockDelete.mockRejectedValueOnce(forbiddenError);
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeletePublication(), { wrapper });
      result.current.mutate("pub-other-user");

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Forbidden");
    });
  });

  describe("initial state", () => {
    it("should start in idle state before any mutation is triggered", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useDeletePublication(), { wrapper });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});
