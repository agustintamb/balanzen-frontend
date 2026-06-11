import {
  Address,
  AddressInput,
  AddressListResponse,
  AddressSearchResponse,
} from "@/api/addresses/addresses.types";
import apiClient from "@/api/client";

export const addressesService = {
  search: (q: string): Promise<AddressSearchResponse> =>
    apiClient.get("/addresses/search", { params: { q } }),

  list: (): Promise<AddressListResponse> => apiClient.get("/addresses"),

  create: (body: AddressInput): Promise<Address> =>
    apiClient.post("/addresses", body),

  update: (id: string, body: Partial<AddressInput>): Promise<Address> =>
    apiClient.put(`/addresses/${id}`, body),

  delete: (id: string): Promise<void> => apiClient.delete(`/addresses/${id}`),

  select: (id: string): Promise<Address> =>
    apiClient.put(`/addresses/${id}/select`),
};
