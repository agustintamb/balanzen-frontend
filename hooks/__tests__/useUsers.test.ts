import { renderHook, waitFor } from "@testing-library/react-native";

import createWrapper from "@/__test-utils__/createWrapper";
import type { AddressSummary } from "@/api/addresses/addresses.types";
import type {
  PublicUser,
  PublicUserCommerce,
  PublicUserConsumer,
  UpdateProfileBody,
  User,
} from "@/api/users/users.types";
import { usersService } from "@/api/users/users.service";
import {
  useCurrentUser,
  usePublicProfile,
  useUpdateProfile,
} from "@/hooks/useUsers";

jest.mock("@/api/users/users.service", () => ({
  usersService: {
    getMe: jest.fn(),
    updateMe: jest.fn(),
    getPublicProfile: jest.fn(),
  },
}));

const mockedUsersService = usersService as jest.Mocked<typeof usersService>;

// ── fixtures ──────────────────────────────────────────────────────────────────

const mockSelectedAddress: AddressSummary = {
  id: "addr-uuid-001",
  formatted_address: "Av. Corrientes 1234, Buenos Aires",
  street: "Av. Corrientes",
  number: "1234",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6037,
  lng: -58.3816,
};

const buildUser = (overrides?: Partial<User>): User => ({
  id: "user-uuid-001",
  email: "consumer@example.com",
  role: "CONSUMIDOR",
  first_name: "Juan",
  last_name: "Pérez",
  phone: "+5491112345678",
  dni: "35123456",
  photo_url: null,
  has_address: true,
  selected_address: mockSelectedAddress,
  created_at: "2026-01-15T10:00:00.000Z",
  ...overrides,
});

const buildCommerceUser = (overrides?: Partial<User>): User =>
  buildUser({
    id: "user-uuid-002",
    email: "commerce@example.com",
    role: "COMERCIO",
    first_name: "María",
    last_name: "González",
    business_name: "La Panadería",
    cuit: "20351234568",
    description: "Panadería artesanal",
    ...overrides,
  });

const buildPublicConsumer = (
  overrides?: Partial<PublicUserConsumer>
): PublicUserConsumer => ({
  id: "user-uuid-001",
  first_name: "Juan",
  last_name: "Pérez",
  photo_url: null,
  ...overrides,
});

const buildPublicCommerce = (
  overrides?: Partial<PublicUserCommerce>
): PublicUserCommerce => ({
  id: "user-uuid-002",
  first_name: "María",
  last_name: "González",
  photo_url: "https://cdn.example.com/photos/commerce.jpg",
  business_name: "La Panadería",
  selected_address: {
    formatted_address: "Av. Corrientes 1234, Buenos Aires",
    lat: -34.6037,
    lng: -58.3816,
  },
  ...overrides,
});

// ── helpers ───────────────────────────────────────────────────────────────────

// ── tests ─────────────────────────────────────────────────────────────────────

describe("useUsers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("useCurrentUser", () => {
    it("should return the current user on successful fetch", async () => {
      const { wrapper } = createWrapper();
      const user = buildUser();
      mockedUsersService.getMe.mockResolvedValueOnce(user);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(user);
    });

    it("should call usersService.getMe exactly once on mount", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getMe.mockResolvedValueOnce(buildUser());

      renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() =>
        expect(mockedUsersService.getMe).toHaveBeenCalledTimes(1)
      );
    });

    it("should use queryKey ['users', 'me']", async () => {
      const { wrapper, queryClient } = createWrapper();
      mockedUsersService.getMe.mockResolvedValueOnce(buildUser());

      renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() =>
        expect(queryClient.getQueryState(["users", "me"])).toBeDefined()
      );
    });

    it("should return a COMERCIO user with commerce-specific fields", async () => {
      const { wrapper } = createWrapper();
      const commerceUser = buildCommerceUser();
      mockedUsersService.getMe.mockResolvedValueOnce(commerceUser);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.role).toBe("COMERCIO");
      expect(result.current.data?.business_name).toBe("La Panadería");
      expect(result.current.data?.cuit).toBe("20351234568");
    });

    it("should return a CONSUMIDOR user without commerce-specific fields", async () => {
      const { wrapper } = createWrapper();
      const consumerUser = buildUser();
      mockedUsersService.getMe.mockResolvedValueOnce(consumerUser);

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.role).toBe("CONSUMIDOR");
      expect(result.current.data?.business_name).toBeUndefined();
    });

    it("should set isError to true when the service rejects", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getMe.mockRejectedValueOnce(new Error("Unauthorized"));

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Unauthorized");
    });

    it("should start in loading state before data resolves", () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getMe.mockImplementation(
        () => new Promise(() => undefined)
      );

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should return user with null photo_url when user has no photo", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getMe.mockResolvedValueOnce(
        buildUser({ photo_url: null })
      );

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.photo_url).toBeNull();
    });

    it("should return user with has_address false when no address is set", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getMe.mockResolvedValueOnce(
        buildUser({ has_address: false, selected_address: null })
      );

      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.has_address).toBe(false);
      expect(result.current.data?.selected_address).toBeNull();
    });
  });

  describe("usePublicProfile", () => {
    it("should return the public profile of a consumer on successful fetch", async () => {
      const { wrapper } = createWrapper();
      const profile: PublicUser = buildPublicConsumer();
      mockedUsersService.getPublicProfile.mockResolvedValueOnce(profile);

      const { result } = renderHook(
        () => usePublicProfile("user-uuid-001"),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(profile);
    });

    it("should return the public profile of a commerce with address info", async () => {
      const { wrapper } = createWrapper();
      const profile: PublicUser = buildPublicCommerce();
      mockedUsersService.getPublicProfile.mockResolvedValueOnce(profile);

      const { result } = renderHook(
        () => usePublicProfile("user-uuid-002"),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const commerceProfile = result.current.data as PublicUserCommerce;
      expect(commerceProfile.business_name).toBe("La Panadería");
      expect(commerceProfile.selected_address.formatted_address).toBe(
        "Av. Corrientes 1234, Buenos Aires"
      );
    });

    it("should call usersService.getPublicProfile with the correct id", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getPublicProfile.mockResolvedValueOnce(
        buildPublicConsumer()
      );

      renderHook(() => usePublicProfile("user-uuid-001"), { wrapper });

      await waitFor(() =>
        expect(mockedUsersService.getPublicProfile).toHaveBeenCalledWith(
          "user-uuid-001"
        )
      );
    });

    it("should use queryKey ['users', id, 'public']", async () => {
      const { wrapper, queryClient } = createWrapper();
      mockedUsersService.getPublicProfile.mockResolvedValueOnce(
        buildPublicConsumer()
      );

      renderHook(() => usePublicProfile("user-uuid-001"), { wrapper });

      await waitFor(() =>
        expect(
          queryClient.getQueryState(["users", "user-uuid-001", "public"])
        ).toBeDefined()
      );
    });

    it("should not fetch when id is an empty string", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => usePublicProfile(""), {
        wrapper,
      });

      expect(mockedUsersService.getPublicProfile).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe("idle");
    });

    it("should set isError to true when the service rejects with 404", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getPublicProfile.mockRejectedValueOnce(
        new Error("Not Found")
      );

      const { result } = renderHook(
        () => usePublicProfile("nonexistent-id"),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Not Found");
    });

    it("should pass a different id correctly when querying another user", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.getPublicProfile.mockResolvedValueOnce(
        buildPublicCommerce({ id: "user-uuid-999" })
      );

      renderHook(() => usePublicProfile("user-uuid-999"), { wrapper });

      await waitFor(() =>
        expect(mockedUsersService.getPublicProfile).toHaveBeenCalledWith(
          "user-uuid-999"
        )
      );
    });
  });

  describe("useUpdateProfile", () => {
    it("should call usersService.updateMe with the profile body on mutate", async () => {
      const { wrapper } = createWrapper();
      const updatedUser = buildUser({ first_name: "Carlos" });
      const body: UpdateProfileBody = { first_name: "Carlos" };
      mockedUsersService.updateMe.mockResolvedValueOnce(updatedUser);

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });
      result.current.mutate(body);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUsersService.updateMe).toHaveBeenCalledWith(body, expect.anything());
    });

    it("should call usersService.updateMe exactly once per mutate call", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.updateMe.mockResolvedValueOnce(buildUser());

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });
      result.current.mutate({ last_name: "Rodríguez" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUsersService.updateMe).toHaveBeenCalledTimes(1);
    });

    it("should update queryData for ['users', 'me'] on success", async () => {
      const { wrapper, queryClient } = createWrapper();
      const updatedUser = buildUser({ first_name: "Carlos", last_name: "López" });
      mockedUsersService.updateMe.mockResolvedValueOnce(updatedUser);
      const setQueryDataSpy = jest.spyOn(queryClient, "setQueryData");

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });
      result.current.mutate({ first_name: "Carlos", last_name: "López" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(setQueryDataSpy).toHaveBeenCalledWith(["users", "me"], updatedUser);
    });

    it("should return the updated user in the mutation result", async () => {
      const { wrapper } = createWrapper();
      const updatedUser = buildUser({ phone: "+5491199887766" });
      mockedUsersService.updateMe.mockResolvedValueOnce(updatedUser);

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });
      result.current.mutate({ phone: "+5491199887766" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(updatedUser);
    });

    it("should set isError to true when the service rejects", async () => {
      const { wrapper } = createWrapper();
      mockedUsersService.updateMe.mockRejectedValueOnce(
        new Error("Validation Error")
      );

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });
      result.current.mutate({ email: "invalid-email" });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Validation Error");
    });

    it("should not call setQueryData when the mutation fails", async () => {
      const { wrapper, queryClient } = createWrapper();
      mockedUsersService.updateMe.mockRejectedValueOnce(new Error("Server Error"));
      const setQueryDataSpy = jest.spyOn(queryClient, "setQueryData");

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });
      result.current.mutate({ first_name: "Test" });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(setQueryDataSpy).not.toHaveBeenCalled();
    });

    it("should be in idle state before mutate is called", () => {
      const { wrapper } = createWrapper();

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });

      expect(result.current.isIdle).toBe(true);
    });

    it("should update commerce-specific fields for a COMERCIO user", async () => {
      const { wrapper } = createWrapper();
      const updatedCommerce = buildCommerceUser({
        business_name: "Nueva Panadería",
        description: "Especialistas en pan artesanal",
      });
      const body: UpdateProfileBody = {
        business_name: "Nueva Panadería",
        description: "Especialistas en pan artesanal",
      };
      mockedUsersService.updateMe.mockResolvedValueOnce(updatedCommerce);

      const { result } = renderHook(() => useUpdateProfile(), { wrapper });
      result.current.mutate(body);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUsersService.updateMe).toHaveBeenCalledWith(body, expect.anything());
      expect(result.current.data?.business_name).toBe("Nueva Panadería");
    });
  });
});
