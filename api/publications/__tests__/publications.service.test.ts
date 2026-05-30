import { publicationsService } from "@/api/publications/publications.service";
import {
  CreatePublicationBody,
  MyPublicationsFilters,
  Publication,
  PublicationFilters,
  PublicationListResponse,
  UpdatePublicationBody,
} from "@/api/publications/publications.types";

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/api/client", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
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

describe("publicationsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should call GET /publications with no params when called with no arguments", async () => {
      mockGet.mockResolvedValueOnce(buildPublicationListResponse());

      await publicationsService.list();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/publications", { params: undefined });
    });

    it("should call GET /publications passing all provided filter params", async () => {
      const filters: PublicationFilters = {
        page: 2,
        limit: 5,
        category_id: "cat-1",
        min_discount: 20,
        max_price: 1000,
        sort_by: "discount_pct",
        sort_order: "desc",
        lat: -34.6037,
        lng: -58.3816,
        radius_km: 5,
        donation: false,
        search: "pan",
      };
      mockGet.mockResolvedValueOnce(buildPublicationListResponse());

      await publicationsService.list(filters);

      expect(mockGet).toHaveBeenCalledWith("/publications", { params: filters });
    });

    it("should return a PublicationListResponse with publications and pagination", async () => {
      const mockResponse = buildPublicationListResponse({
        publications: [buildPublication({ id: "pub-1" }), buildPublication({ id: "pub-2" })],
        pagination: { page: 1, limit: 10, total: 2, total_pages: 1 },
      });
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await publicationsService.list();

      expect(result.publications).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it("should return an empty publications list when no results found", async () => {
      const mockResponse = buildPublicationListResponse({
        publications: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
      });
      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await publicationsService.list({ search: "nonexistent" });

      expect(result.publications).toHaveLength(0);
    });

    it("should propagate errors thrown by the API client", async () => {
      mockGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(publicationsService.list()).rejects.toThrow("Network Error");
    });

    it("should pass only the provided partial filter params", async () => {
      const filters: PublicationFilters = { page: 1, category_id: "cat-2" };
      mockGet.mockResolvedValueOnce(buildPublicationListResponse());

      await publicationsService.list(filters);

      expect(mockGet).toHaveBeenCalledWith("/publications", { params: filters });
    });
  });

  describe("getById", () => {
    it("should call GET /publications/:id with the correct id", async () => {
      const pub = buildPublication({ id: "pub-abc" });
      mockGet.mockResolvedValueOnce(pub);

      await publicationsService.getById("pub-abc");

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/publications/pub-abc");
    });

    it("should return the Publication matching the given id", async () => {
      const pub = buildPublication({ id: "pub-abc", title: "Medialunas" });
      mockGet.mockResolvedValueOnce(pub);

      const result = await publicationsService.getById("pub-abc");

      expect(result.id).toBe("pub-abc");
      expect(result.title).toBe("Medialunas");
    });

    it("should propagate a 404 error when publication does not exist", async () => {
      const notFoundError = Object.assign(new Error("Not Found"), {
        response: { status: 404 },
      });
      mockGet.mockRejectedValueOnce(notFoundError);

      await expect(publicationsService.getById("nonexistent-id")).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it("should interpolate the id correctly in the URL for different id values", async () => {
      const pub = buildPublication({ id: "uuid-1234-abcd" });
      mockGet.mockResolvedValueOnce(pub);

      await publicationsService.getById("uuid-1234-abcd");

      expect(mockGet).toHaveBeenCalledWith("/publications/uuid-1234-abcd");
    });

    it("should return a donation publication correctly", async () => {
      const pub = buildPublication({ id: "pub-donation", is_donation: true, final_price: 0 });
      mockGet.mockResolvedValueOnce(pub);

      const result = await publicationsService.getById("pub-donation");

      expect(result.is_donation).toBe(true);
      expect(result.final_price).toBe(0);
    });
  });

  describe("getMyPublications", () => {
    it("should call GET /publications/me with no params when called with no arguments", async () => {
      mockGet.mockResolvedValueOnce(buildPublicationListResponse());

      await publicationsService.getMyPublications();

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("/publications/me", { params: undefined });
    });

    it("should call GET /publications/me passing status filter param", async () => {
      const filters: MyPublicationsFilters = { status: "ACTIVE" };
      mockGet.mockResolvedValueOnce(buildPublicationListResponse());

      await publicationsService.getMyPublications(filters);

      expect(mockGet).toHaveBeenCalledWith("/publications/me", { params: filters });
    });

    it("should call GET /publications/me passing pagination params", async () => {
      const filters: MyPublicationsFilters = { page: 2, limit: 5 };
      mockGet.mockResolvedValueOnce(buildPublicationListResponse());

      await publicationsService.getMyPublications(filters);

      expect(mockGet).toHaveBeenCalledWith("/publications/me", { params: filters });
    });

    it("should return a PublicationListResponse for my publications", async () => {
      const myPubs = buildPublicationListResponse({
        publications: [
          buildPublication({ id: "my-pub-1" }),
          buildPublication({ id: "my-pub-2", status: "EXPIRED" }),
        ],
      });
      mockGet.mockResolvedValueOnce(myPubs);

      const result = await publicationsService.getMyPublications();

      expect(result.publications).toHaveLength(2);
      expect(result.publications[1].status).toBe("EXPIRED");
    });

    it("should propagate errors thrown by the API client", async () => {
      mockGet.mockRejectedValueOnce(new Error("Forbidden"));

      await expect(publicationsService.getMyPublications()).rejects.toThrow("Forbidden");
    });

    it("should pass combined status and pagination filters", async () => {
      const filters: MyPublicationsFilters = { status: "RESERVED", page: 1, limit: 20 };
      mockGet.mockResolvedValueOnce(buildPublicationListResponse());

      await publicationsService.getMyPublications(filters);

      expect(mockGet).toHaveBeenCalledWith("/publications/me", { params: filters });
    });
  });

  describe("create", () => {
    const buildCreateBody = (overrides: Partial<CreatePublicationBody> = {}): CreatePublicationBody => ({
      title: "Facturas",
      description: "Facturas de grasa de hoy",
      original_price: 600,
      final_price: 300,
      expiry_date: "2026-05-31",
      category_id: "cat-1",
      photos: ["https://cdn.example.com/facturas.jpg"],
      ...overrides,
    });

    it("should call POST /publications with the given body", async () => {
      const body = buildCreateBody();
      const created = buildPublication();
      mockPost.mockResolvedValueOnce(created);

      await publicationsService.create(body);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/publications", body);
    });

    it("should return the created Publication", async () => {
      const body = buildCreateBody({ title: "Croissants" });
      const created = buildPublication({ title: "Croissants" });
      mockPost.mockResolvedValueOnce(created);

      const result = await publicationsService.create(body);

      expect(result.title).toBe("Croissants");
      expect(result.id).toBeDefined();
    });

    it("should pass a body with multiple photos correctly", async () => {
      const body = buildCreateBody({
        photos: [
          "https://cdn.example.com/photo1.jpg",
          "https://cdn.example.com/photo2.jpg",
        ],
      });
      mockPost.mockResolvedValueOnce(buildPublication());

      await publicationsService.create(body);

      expect(mockPost).toHaveBeenCalledWith("/publications", body);
    });

    it("should pass a body for a donation publication (final_price: 0)", async () => {
      const body = buildCreateBody({ original_price: 400, final_price: 0 });
      mockPost.mockResolvedValueOnce(buildPublication({ is_donation: true, final_price: 0 }));

      await publicationsService.create(body);

      const [, passedBody] = mockPost.mock.calls[0];
      expect(passedBody.final_price).toBe(0);
    });

    it("should propagate a 422 validation error from the API client", async () => {
      const validationError = Object.assign(new Error("Unprocessable Entity"), {
        response: { status: 422 },
      });
      mockPost.mockRejectedValueOnce(validationError);

      await expect(publicationsService.create(buildCreateBody())).rejects.toMatchObject({
        response: { status: 422 },
      });
    });

    it("should not call GET, PUT, or DELETE when creating", async () => {
      mockPost.mockResolvedValueOnce(buildPublication());

      await publicationsService.create(buildCreateBody());

      expect(mockGet).not.toHaveBeenCalled();
      expect(mockPut).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    const buildUpdateBody = (overrides: Partial<UpdatePublicationBody> = {}): UpdatePublicationBody => ({
      title: "Pan artesanal actualizado",
      final_price: 200,
      ...overrides,
    });

    it("should call PUT /publications/:id with the correct id and body", async () => {
      const body = buildUpdateBody();
      const updated = buildPublication({ id: "pub-xyz" });
      mockPut.mockResolvedValueOnce(updated);

      await publicationsService.update("pub-xyz", body);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith("/publications/pub-xyz", body);
    });

    it("should return the updated Publication", async () => {
      const body = buildUpdateBody({ title: "Nuevo título" });
      const updated = buildPublication({ title: "Nuevo título" });
      mockPut.mockResolvedValueOnce(updated);

      const result = await publicationsService.update("pub-1", body);

      expect(result.title).toBe("Nuevo título");
    });

    it("should pass a partial body with only updated fields", async () => {
      const partialBody: UpdatePublicationBody = { final_price: 150 };
      mockPut.mockResolvedValueOnce(buildPublication({ final_price: 150 }));

      await publicationsService.update("pub-1", partialBody);

      expect(mockPut).toHaveBeenCalledWith("/publications/pub-1", partialBody);
    });

    it("should interpolate the id correctly in the URL", async () => {
      mockPut.mockResolvedValueOnce(buildPublication({ id: "uuid-99" }));

      await publicationsService.update("uuid-99", {});

      expect(mockPut).toHaveBeenCalledWith("/publications/uuid-99", {});
    });

    it("should propagate a 404 error when publication to update does not exist", async () => {
      const notFoundError = Object.assign(new Error("Not Found"), {
        response: { status: 404 },
      });
      mockPut.mockRejectedValueOnce(notFoundError);

      await expect(publicationsService.update("bad-id", {})).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it("should not call GET, POST, or DELETE when updating", async () => {
      mockPut.mockResolvedValueOnce(buildPublication());

      await publicationsService.update("pub-1", buildUpdateBody());

      expect(mockGet).not.toHaveBeenCalled();
      expect(mockPost).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should call DELETE /publications/:id with the correct id", async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await publicationsService.delete("pub-del-1");

      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledWith("/publications/pub-del-1");
    });

    it("should resolve with void/undefined on successful deletion", async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      const result = await publicationsService.delete("pub-del-1");

      expect(result).toBeUndefined();
    });

    it("should interpolate different id values correctly in the URL", async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await publicationsService.delete("uuid-del-9999");

      expect(mockDelete).toHaveBeenCalledWith("/publications/uuid-del-9999");
    });

    it("should propagate a 404 error when publication to delete does not exist", async () => {
      const notFoundError = Object.assign(new Error("Not Found"), {
        response: { status: 404 },
      });
      mockDelete.mockRejectedValueOnce(notFoundError);

      await expect(publicationsService.delete("nonexistent")).rejects.toMatchObject({
        response: { status: 404 },
      });
    });

    it("should propagate a 403 error when user lacks permission to delete", async () => {
      const forbiddenError = Object.assign(new Error("Forbidden"), {
        response: { status: 403 },
      });
      mockDelete.mockRejectedValueOnce(forbiddenError);

      await expect(publicationsService.delete("pub-other-user")).rejects.toMatchObject({
        response: { status: 403 },
      });
    });

    it("should not call GET, POST, or PUT when deleting", async () => {
      mockDelete.mockResolvedValueOnce(undefined);

      await publicationsService.delete("pub-1");

      expect(mockGet).not.toHaveBeenCalled();
      expect(mockPost).not.toHaveBeenCalled();
      expect(mockPut).not.toHaveBeenCalled();
    });
  });
});
