import apiClient from "@/api/client";
import { PublicUser, UpdateProfileBody, User } from "@/api/users/users.types";

export const usersService = {
  getMe: (): Promise<User> => apiClient.get("/users/me"),

  updateMe: (body: UpdateProfileBody): Promise<User> =>
    apiClient.put("/users/me", body),

  getPublicProfile: (id: string): Promise<PublicUser> =>
    apiClient.get(`/users/${id}/public`),
};
