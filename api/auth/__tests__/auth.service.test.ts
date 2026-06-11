import { authService } from "@/api/auth/auth.service";
import type {
  ChangePasswordBody,
  LoginBody,
  LoginResponse,
  RegisterCommerceBody,
  RegisterConsumerBody,
  RegisterResponse,
} from "@/api/auth/auth.types";
import apiClient from "@/api/client";

jest.mock("@/api/client", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
const mockPut = apiClient.put as jest.MockedFunction<typeof apiClient.put>;

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockRegisterConsumerBody: RegisterConsumerBody = {
  role: "CONSUMIDOR",
  first_name: "Ana",
  last_name: "García",
  email: "ana@example.com",
  password: "Secret123!",
  confirm_password: "Secret123!",
  phone: "+5491112345678",
  dni: "30123456",
};

const mockRegisterCommerceBody: RegisterCommerceBody = {
  role: "COMERCIO",
  first_name: "Juan",
  last_name: "Pérez",
  email: "juan@comercio.com",
  password: "Secret123!",
  confirm_password: "Secret123!",
  phone: "+5491187654321",
  dni: "20987654",
  business_name: "Panadería San Juan",
  cuit: "20209876543",
};

const mockRegisterResponse: RegisterResponse = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "ana@example.com",
  role: "CONSUMIDOR",
  first_name: "Ana",
  last_name: "García",
  access_token: "access.jwt.token",
  refresh_token: "refresh.jwt.token",
};

const mockRegisterCommerceResponse: RegisterResponse = {
  id: "660f9511-f30c-52e5-b827-557766551111",
  email: "juan@comercio.com",
  role: "COMERCIO",
  first_name: "Juan",
  last_name: "Pérez",
  business_name: "Panadería San Juan",
  access_token: "access.jwt.commerce.token",
  refresh_token: "refresh.jwt.commerce.token",
};

const mockLoginBody: LoginBody = {
  email: "ana@example.com",
  password: "Secret123!",
};

const mockLoginResponse: LoginResponse = {
  access_token: "access.jwt.token",
  refresh_token: "refresh.jwt.token",
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    email: "ana@example.com",
    role: "CONSUMIDOR",
    first_name: "Ana",
    last_name: "García",
    photo_url: null,
    has_address: false,
  },
};

const mockChangePasswordBody: ChangePasswordBody = {
  current_password: "OldSecret123!",
  new_password: "NewSecret456!",
  confirm_password: "NewSecret456!",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("authService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe("register", () => {
    it("should POST to /auth/register and return RegisterResponse when consumer body is valid", async () => {
      mockPost.mockResolvedValueOnce(mockRegisterResponse);

      const result = await authService.register(mockRegisterConsumerBody);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(
        "/auth/register",
        mockRegisterConsumerBody,
      );
      expect(result).toEqual(mockRegisterResponse);
    });

    it("should POST to /auth/register and return RegisterResponse when commerce body is valid", async () => {
      mockPost.mockResolvedValueOnce(mockRegisterCommerceResponse);

      const result = await authService.register(mockRegisterCommerceBody);

      expect(mockPost).toHaveBeenCalledWith(
        "/auth/register",
        mockRegisterCommerceBody,
      );
      expect(result).toEqual(mockRegisterCommerceResponse);
      expect(result.business_name).toBe("Panadería San Juan");
    });

    it("should hit the exact endpoint /auth/register", async () => {
      mockPost.mockResolvedValueOnce(mockRegisterResponse);

      await authService.register(mockRegisterConsumerBody);

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/auth/register");
    });

    it("should propagate the error when apiClient.post rejects on register", async () => {
      const networkError = new Error("Network Error");
      mockPost.mockRejectedValueOnce(networkError);

      await expect(
        authService.register(mockRegisterConsumerBody),
      ).rejects.toThrow("Network Error");
    });

    it("should forward the full body to apiClient without modifications", async () => {
      mockPost.mockResolvedValueOnce(mockRegisterCommerceResponse);

      await authService.register(mockRegisterCommerceBody);

      const [, body] = mockPost.mock.calls[0];
      expect(body).toStrictEqual(mockRegisterCommerceBody);
    });
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("should POST to /auth/login and return LoginResponse when credentials are valid", async () => {
      mockPost.mockResolvedValueOnce(mockLoginResponse);

      const result = await authService.login(mockLoginBody);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/auth/login", mockLoginBody);
      expect(result).toEqual(mockLoginResponse);
    });

    it("should hit the exact endpoint /auth/login", async () => {
      mockPost.mockResolvedValueOnce(mockLoginResponse);

      await authService.login(mockLoginBody);

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/auth/login");
    });

    it("should return access_token and refresh_token in LoginResponse", async () => {
      mockPost.mockResolvedValueOnce(mockLoginResponse);

      const result = await authService.login(mockLoginBody);

      expect(result.access_token).toBe("access.jwt.token");
      expect(result.refresh_token).toBe("refresh.jwt.token");
    });

    it("should return the user object nested inside LoginResponse", async () => {
      mockPost.mockResolvedValueOnce(mockLoginResponse);

      const result = await authService.login(mockLoginBody);

      expect(result.user.id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(result.user.role).toBe("CONSUMIDOR");
      expect(result.user.has_address).toBe(false);
    });

    it("should propagate the error when apiClient.post rejects on login", async () => {
      const authError = new Error("Invalid credentials");
      mockPost.mockRejectedValueOnce(authError);

      await expect(authService.login(mockLoginBody)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should forward the full body to apiClient without modifications", async () => {
      mockPost.mockResolvedValueOnce(mockLoginResponse);

      await authService.login(mockLoginBody);

      const [, body] = mockPost.mock.calls[0];
      expect(body).toStrictEqual(mockLoginBody);
    });
  });

  // ── refresh ────────────────────────────────────────────────────────────────

  describe("refresh", () => {
    it("should POST to /auth/refresh and return access_token", async () => {
      const mockRefreshResponse = { access_token: "new.access.jwt.token" };
      mockPost.mockResolvedValueOnce(mockRefreshResponse);

      const result = await authService.refresh();

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/auth/refresh");
      expect(result).toEqual(mockRefreshResponse);
    });

    it("should hit the exact endpoint /auth/refresh", async () => {
      mockPost.mockResolvedValueOnce({ access_token: "new.token" });

      await authService.refresh();

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/auth/refresh");
    });

    it("should return the new access_token string", async () => {
      mockPost.mockResolvedValueOnce({ access_token: "brand.new.token" });

      const result = await authService.refresh();

      expect(result.access_token).toBe("brand.new.token");
    });

    it("should call apiClient.post with no body when refreshing", async () => {
      mockPost.mockResolvedValueOnce({ access_token: "token" });

      await authService.refresh();

      expect(mockPost).toHaveBeenCalledWith("/auth/refresh");
      expect(mockPost.mock.calls[0].length).toBe(1);
    });

    it("should propagate the error when apiClient.post rejects on refresh", async () => {
      const expiredError = new Error("Refresh token expired");
      mockPost.mockRejectedValueOnce(expiredError);

      await expect(authService.refresh()).rejects.toThrow(
        "Refresh token expired",
      );
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("should POST to /auth/logout and resolve", async () => {
      mockPost.mockResolvedValueOnce(undefined);

      await expect(authService.logout()).resolves.toBeUndefined();

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith("/auth/logout");
    });

    it("should hit the exact endpoint /auth/logout", async () => {
      mockPost.mockResolvedValueOnce(undefined);

      await authService.logout();

      const [endpoint] = mockPost.mock.calls[0];
      expect(endpoint).toBe("/auth/logout");
    });

    it("should call apiClient.post with no body on logout", async () => {
      mockPost.mockResolvedValueOnce(undefined);

      await authService.logout();

      expect(mockPost.mock.calls[0].length).toBe(1);
    });

    it("should propagate the error when apiClient.post rejects on logout", async () => {
      const sessionError = new Error("Session not found");
      mockPost.mockRejectedValueOnce(sessionError);

      await expect(authService.logout()).rejects.toThrow("Session not found");
    });
  });

  // ── changePassword ─────────────────────────────────────────────────────────

  describe("changePassword", () => {
    it("should PUT to /auth/password and return message when body is valid", async () => {
      const mockResponse = { message: "Password updated successfully" };
      mockPut.mockResolvedValueOnce(mockResponse);

      const result = await authService.changePassword(mockChangePasswordBody);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith(
        "/auth/password",
        mockChangePasswordBody,
      );
      expect(result).toEqual(mockResponse);
    });

    it("should hit the exact endpoint /auth/password", async () => {
      mockPut.mockResolvedValueOnce({ message: "ok" });

      await authService.changePassword(mockChangePasswordBody);

      const [endpoint] = mockPut.mock.calls[0];
      expect(endpoint).toBe("/auth/password");
    });

    it("should return the message string from the response", async () => {
      mockPut.mockResolvedValueOnce({ message: "Password changed" });

      const result = await authService.changePassword(mockChangePasswordBody);

      expect(result.message).toBe("Password changed");
    });

    it("should forward the full body to apiClient.put without modifications", async () => {
      mockPut.mockResolvedValueOnce({ message: "ok" });

      await authService.changePassword(mockChangePasswordBody);

      const [, body] = mockPut.mock.calls[0];
      expect(body).toStrictEqual(mockChangePasswordBody);
    });

    it("should use PUT (not POST) for changePassword", async () => {
      mockPut.mockResolvedValueOnce({ message: "ok" });

      await authService.changePassword(mockChangePasswordBody);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPost).not.toHaveBeenCalled();
    });

    it("should propagate the error when apiClient.put rejects on changePassword", async () => {
      const wrongPasswordError = new Error("Current password is incorrect");
      mockPut.mockRejectedValueOnce(wrongPasswordError);

      await expect(
        authService.changePassword(mockChangePasswordBody),
      ).rejects.toThrow("Current password is incorrect");
    });

    it("should propagate a generic server error when apiClient.put rejects with unknown error", async () => {
      mockPut.mockRejectedValueOnce(new Error("Internal Server Error"));

      await expect(
        authService.changePassword(mockChangePasswordBody),
      ).rejects.toThrow("Internal Server Error");
    });
  });
});
