import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addressesService } from "@/api/addresses/addresses.service";
import {
  Address,
  AddressInput,
  AddressSearchResult,
} from "@/api/addresses/addresses.types";

export const useAddressSearch = (q: string) =>
  useQuery<AddressSearchResult[], Error>({
    queryKey: ["addresses", "search", q],
    queryFn: async () => {
      const res = await addressesService.search(q);
      return res.results;
    },
    enabled: q.length >= 3,
    staleTime: 1000 * 60 * 5,
  });

export const useAddresses = () =>
  useQuery<Address[], Error>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await addressesService.list();
      return res.addresses;
    },
    staleTime: 1000 * 60 * 5,
  });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<Address, Error, AddressInput>({
    mutationFn: addressesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Address,
    Error,
    { id: string; body: Partial<AddressInput> }
  >({
    mutationFn: ({ id, body }) => addressesService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: addressesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });
};

export const useSelectAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<Address, Error, string>({
    mutationFn: addressesService.select,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
    },
  });
};
