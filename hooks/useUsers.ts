import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { usersService } from "@/api/users/users.service";
import { PublicUser, UpdateProfileBody, User } from "@/api/users/users.types";

export const useCurrentUser = () =>
  useQuery<User, Error>({
    queryKey: ["users", "me"],
    queryFn: usersService.getMe,
    staleTime: 1000 * 60 * 5,
  });

export const usePublicProfile = (id: string) =>
  useQuery<PublicUser, Error>({
    queryKey: ["users", id, "public"],
    queryFn: () => usersService.getPublicProfile(id),
    enabled: !!id,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, UpdateProfileBody>({
    mutationFn: usersService.updateMe,
    onSuccess: (updated) => {
      queryClient.setQueryData(["users", "me"], updated);
    },
  });
};
