import apiClient from "@/api/client";
import {
  CreatePublicationBody,
  MyPublicationsFilters,
  Publication,
  PublicationFilters,
  PublicationListResponse,
  UpdatePublicationBody,
} from "@/api/publications/publications.types";

export const publicationsService = {
  list: (params?: PublicationFilters): Promise<PublicationListResponse> =>
    apiClient.get("/publications", { params }),

  getById: (id: string): Promise<Publication> =>
    apiClient.get(`/publications/${id}`),

  getMyPublications: (
    params?: MyPublicationsFilters,
  ): Promise<PublicationListResponse> =>
    apiClient.get("/publications/me", { params }),

  create: (body: CreatePublicationBody): Promise<Publication> =>
    apiClient.post("/publications", body),

  update: (id: string, body: UpdatePublicationBody): Promise<Publication> =>
    apiClient.put(`/publications/${id}`, body),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/publications/${id}`),
};
