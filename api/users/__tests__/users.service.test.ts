import apiClient from "@/api/client";
import { usersService } from "@/api/users/users.service";
import {
  PublicUser,
  PublicUserCommerce,
  PublicUserConsumer,
  UpdateProfileBody,
  User,
} from "@/api/users/users.types";

jest.mock("@/api/client", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockAddressSummary = {
  id: "addr-uuid-1234",
  formatted_address: "Av. Corrientes 1234, Buenos Aires",
  street: "Av. Corrientes",
  number: "1234",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6037,
  lng: -58.3816,
};

const mockConsumerUser: User = {
  id: "user-uuid-consumer-1",
  email: "consumer@example.com",
  role: "CONSUMIDOR",
  first_name: "Ana",
  last_name: "García",
  phone: "+5491123456789",
  dni: "30123456",
  photo_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  has_address: true,
  selected_address: mockAddressSummary,
  created_at: "2024-01-15T10:00:00.000Z",
};

const mockCommerceUser: User = {
  id: "user-uuid-commerce-1",
  email: "comercio@example.com",
  role: "COMERCIO",
  first_name: "Carlos",
  last_name: "López",
  phone: "+5491187654321",
  dni: "25987654",
  photo_url: null,
  has_address: true,
  selected_address: mockAddressSummary,
  business_name: "Panadería El Trigo",
  cuit: "20259876543",
  description: "Panadería artesanal con productos frescos",
  created_at: "2023-06-10T08:30:00.000Z",
};

const mockPublicUserCommerce: PublicUserCommerce = {
  id: "user-uuid-commerce-1",
  first_name: "Carlos",
  last_name: "López",
  photo_url: null,
  business_name: "Panadería El Trigo",
  selected_address: {
    formatted_address: "Av. Corrientes 1234, Buenos Aires",
    lat: -34.6037,
    lng: -58.3816,
  },
};

const mockPublicUserConsumer: PublicUserConsumer = {
  id: "user-uuid-consumer-1",
  first_name: "Ana",
  last_name: "García",
  photo_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
};

describe("usersService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMe", () => {
    describe("when the request succeeds", () => {
      it("should call GET /users/me", async () => {
        mockedApiClient.get.mockResolvedValueOnce(mockConsumerUser);

        await usersService.getMe();

        expect(mockedApiClient.get).toHaveBeenCalledWith("/users/me");
        expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
      });

      it("should return the consumer user data", async () => {
        mockedApiClient.get.mockResolvedValueOnce(mockConsumerUser);

        const result = await usersService.getMe();

        expect(result).toEqual(mockConsumerUser);
        expect(result.role).toBe("CONSUMIDOR");
        expect(result.id).toBe("user-uuid-consumer-1");
      });

      it("should return the commerce user data including business fields", async () => {
        mockedApiClient.get.mockResolvedValueOnce(mockCommerceUser);

        const result = await usersService.getMe();

        expect(result).toEqual(mockCommerceUser);
        expect(result.role).toBe("COMERCIO");
        expect(result.business_name).toBe("Panadería El Trigo");
        expect(result.cuit).toBe("20259876543");
      });

      it("should return user with null photo_url when no photo set", async () => {
        const userWithoutPhoto: User = { ...mockConsumerUser, photo_url: null };
        mockedApiClient.get.mockResolvedValueOnce(userWithoutPhoto);

        const result = await usersService.getMe();

        expect(result.photo_url).toBeNull();
      });

      it("should return user with null selected_address when has_address is false", async () => {
        const userWithoutAddress: User = {
          ...mockConsumerUser,
          has_address: false,
          selected_address: null,
        };
        mockedApiClient.get.mockResolvedValueOnce(userWithoutAddress);

        const result = await usersService.getMe();

        expect(result.has_address).toBe(false);
        expect(result.selected_address).toBeNull();
      });
    });

    describe("when the request fails", () => {
      it("should propagate a 401 unauthorized error", async () => {
        const unauthorizedError = Object.assign(new Error("Unauthorized"), {
          response: { status: 401, data: { message: "Unauthorized" } },
        });
        mockedApiClient.get.mockRejectedValueOnce(unauthorizedError);

        await expect(usersService.getMe()).rejects.toThrow("Unauthorized");
      });

      it("should propagate a network error", async () => {
        const networkError = new Error("Network Error");
        mockedApiClient.get.mockRejectedValueOnce(networkError);

        await expect(usersService.getMe()).rejects.toThrow("Network Error");
      });
    });
  });

  describe("updateMe", () => {
    describe("when the request succeeds", () => {
      it("should call PUT /users/me with the provided body", async () => {
        const updateBody: UpdateProfileBody = {
          first_name: "Ana María",
          phone: "+5491199999999",
        };
        mockedApiClient.put.mockResolvedValueOnce(mockConsumerUser);

        await usersService.updateMe(updateBody);

        expect(mockedApiClient.put).toHaveBeenCalledWith(
          "/users/me",
          updateBody,
        );
        expect(mockedApiClient.put).toHaveBeenCalledTimes(1);
      });

      it("should return the updated user data", async () => {
        const updateBody: UpdateProfileBody = { first_name: "Ana María" };
        const updatedUser: User = {
          ...mockConsumerUser,
          first_name: "Ana María",
        };
        mockedApiClient.put.mockResolvedValueOnce(updatedUser);

        const result = await usersService.updateMe(updateBody);

        expect(result).toEqual(updatedUser);
        expect(result.first_name).toBe("Ana María");
      });

      it("should update commerce-specific fields when provided", async () => {
        const updateBody: UpdateProfileBody = {
          business_name: "Panadería El Trigo Premium",
          description: "Panadería artesanal con productos frescos y orgánicos",
        };
        const updatedCommerce: User = {
          ...mockCommerceUser,
          business_name: "Panadería El Trigo Premium",
          description: "Panadería artesanal con productos frescos y orgánicos",
        };
        mockedApiClient.put.mockResolvedValueOnce(updatedCommerce);

        const result = await usersService.updateMe(updateBody);

        expect(result.business_name).toBe("Panadería El Trigo Premium");
        expect(result.description).toBe(
          "Panadería artesanal con productos frescos y orgánicos",
        );
      });

      it("should allow setting photo_url to null to remove the photo", async () => {
        const updateBody: UpdateProfileBody = { photo_url: null };
        const updatedUser: User = { ...mockConsumerUser, photo_url: null };
        mockedApiClient.put.mockResolvedValueOnce(updatedUser);

        const result = await usersService.updateMe(updateBody);

        expect(result.photo_url).toBeNull();
      });

      it("should allow sending an empty body", async () => {
        const updateBody: UpdateProfileBody = {};
        mockedApiClient.put.mockResolvedValueOnce(mockConsumerUser);

        await usersService.updateMe(updateBody);

        expect(mockedApiClient.put).toHaveBeenCalledWith("/users/me", {});
      });
    });

    describe("when the request fails", () => {
      it("should propagate a 422 validation error", async () => {
        const validationError = Object.assign(
          new Error("Unprocessable Entity"),
          {
            response: {
              status: 422,
              data: { message: "Invalid phone format" },
            },
          },
        );
        mockedApiClient.put.mockRejectedValueOnce(validationError);

        await expect(
          usersService.updateMe({ phone: "invalid-phone" }),
        ).rejects.toThrow("Unprocessable Entity");
      });

      it("should propagate a 401 unauthorized error", async () => {
        const unauthorizedError = Object.assign(new Error("Unauthorized"), {
          response: { status: 401, data: { message: "Token expired" } },
        });
        mockedApiClient.put.mockRejectedValueOnce(unauthorizedError);

        await expect(usersService.updateMe({})).rejects.toThrow("Unauthorized");
      });
    });
  });

  describe("getPublicProfile", () => {
    describe("when the request succeeds", () => {
      it("should call GET /users/:id/public with the correct id", async () => {
        const userId = "user-uuid-commerce-1";
        mockedApiClient.get.mockResolvedValueOnce(mockPublicUserCommerce);

        await usersService.getPublicProfile(userId);

        expect(mockedApiClient.get).toHaveBeenCalledWith(
          `/users/${userId}/public`,
        );
        expect(mockedApiClient.get).toHaveBeenCalledTimes(1);
      });

      it("should return commerce public profile data", async () => {
        const userId = "user-uuid-commerce-1";
        mockedApiClient.get.mockResolvedValueOnce(mockPublicUserCommerce);

        const result = await usersService.getPublicProfile(userId);

        expect(result).toEqual(mockPublicUserCommerce);
        const commerceResult = result as PublicUserCommerce;
        expect(commerceResult.business_name).toBe("Panadería El Trigo");
        expect(commerceResult.selected_address.formatted_address).toBe(
          "Av. Corrientes 1234, Buenos Aires",
        );
      });

      it("should return consumer public profile data", async () => {
        const userId = "user-uuid-consumer-1";
        mockedApiClient.get.mockResolvedValueOnce(mockPublicUserConsumer);

        const result = await usersService.getPublicProfile(userId);

        expect(result).toEqual(mockPublicUserConsumer);
        const consumerResult = result as PublicUserConsumer;
        expect(consumerResult.id).toBe("user-uuid-consumer-1");
        expect(consumerResult.photo_url).toBe(
          "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        );
      });

      it("should interpolate different user ids in the URL correctly", async () => {
        const firstId = "uuid-aaa-111";
        const secondId = "uuid-bbb-222";

        mockedApiClient.get
          .mockResolvedValueOnce(mockPublicUserConsumer)
          .mockResolvedValueOnce(mockPublicUserCommerce);

        await usersService.getPublicProfile(firstId);
        await usersService.getPublicProfile(secondId);

        expect(mockedApiClient.get).toHaveBeenNthCalledWith(
          1,
          `/users/${firstId}/public`,
        );
        expect(mockedApiClient.get).toHaveBeenNthCalledWith(
          2,
          `/users/${secondId}/public`,
        );
      });

      it("should return a public user with null photo_url", async () => {
        const userWithoutPhoto: PublicUser = {
          ...mockPublicUserConsumer,
          photo_url: null,
        };
        mockedApiClient.get.mockResolvedValueOnce(userWithoutPhoto);

        const result = await usersService.getPublicProfile(
          "user-uuid-consumer-1",
        );

        expect(result.photo_url).toBeNull();
      });
    });

    describe("when the request fails", () => {
      it("should propagate a 404 not found error when user does not exist", async () => {
        const notFoundError = Object.assign(new Error("Not Found"), {
          response: { status: 404, data: { message: "User not found" } },
        });
        mockedApiClient.get.mockRejectedValueOnce(notFoundError);

        await expect(
          usersService.getPublicProfile("non-existent-uuid"),
        ).rejects.toThrow("Not Found");
      });

      it("should propagate a network error", async () => {
        const networkError = new Error("Network Error");
        mockedApiClient.get.mockRejectedValueOnce(networkError);

        await expect(
          usersService.getPublicProfile("user-uuid-commerce-1"),
        ).rejects.toThrow("Network Error");
      });
    });
  });
});
