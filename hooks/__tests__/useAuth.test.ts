import { renderHook, waitFor } from "@testing-library/react-native";
import createWrapper from "@/__test-utils__/createWrapper";
import { authService } from "@/api/auth/auth.service";
import {
  ChangePasswordBody,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
} from "@/api/auth/auth.types";
import {
  useChangePassword,
  useLogin,
  useLogout,
  useRefreshToken,
  useRegister,
} from "@/hooks/useAuth";

jest.mock("@/api/auth/auth.service", () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    changePassword: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const CONSUMER_REGISTER_BODY: RegisterBody = {
  role: "CONSUMIDOR",
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
  password: "Secret123!",
  confirm_password: "Secret123!",
  phone: "1122334455",
  dni: "12345678",
};

const COMMERCE_REGISTER_BODY: RegisterBody = {
  role: "COMERCIO",
  first_name: "John",
  last_name: "Smith",
  email: "john@commerce.com",
  password: "Secret123!",
  confirm_password: "Secret123!",
  phone: "1199887766",
  dni: "87654321",
  business_name: "Smith Bakery",
  cuit: "20-87654321-9",
};

const REGISTER_RESPONSE: RegisterResponse = {
  id: "user-id-123",
  email: "jane@example.com",
  role: "CONSUMIDOR",
  first_name: "Jane",
  last_name: "Doe",
  access_token: "access-token-abc",
  refresh_token: "refresh-token-xyz",
};

const LOGIN_BODY: LoginBody = {
  email: "jane@example.com",
  password: "Secret123!",
};

const LOGIN_RESPONSE: LoginResponse = {
  access_token: "access-token-abc",
  refresh_token: "refresh-token-xyz",
  user: {
    id: "user-id-123",
    email: "jane@example.com",
    role: "CONSUMIDOR",
    first_name: "Jane",
    last_name: "Doe",
    photo_url: null,
    has_address: false,
  },
};

const CHANGE_PASSWORD_BODY: ChangePasswordBody = {
  current_password: "OldPass123!",
  new_password: "NewPass456!",
  confirm_password: "NewPass456!",
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("useRegister", () => {
  describe("when registration succeeds", () => {
    it("should return data on successful consumer registration", async () => {
      mockedAuthService.register.mockResolvedValueOnce(REGISTER_RESPONSE);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CONSUMER_REGISTER_BODY);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(REGISTER_RESPONSE);
      expect(mockedAuthService.register).toHaveBeenCalledTimes(1);
      expect(mockedAuthService.register).toHaveBeenCalledWith(
        CONSUMER_REGISTER_BODY,
        expect.anything(),
      );
    });

    it("should call authService.register with commerce body", async () => {
      const commerceResponse: RegisterResponse = {
        ...REGISTER_RESPONSE,
        role: "COMERCIO",
        email: "john@commerce.com",
        business_name: "Smith Bakery",
      };
      mockedAuthService.register.mockResolvedValueOnce(commerceResponse);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(COMMERCE_REGISTER_BODY);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedAuthService.register).toHaveBeenCalledWith(
        COMMERCE_REGISTER_BODY,
        expect.anything(),
      );
      expect(result.current.data?.business_name).toBe("Smith Bakery");
    });

    it("should invoke onSuccess callback with the response", async () => {
      mockedAuthService.register.mockResolvedValueOnce(REGISTER_RESPONSE);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CONSUMER_REGISTER_BODY, { onSuccess });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(
        REGISTER_RESPONSE,
        CONSUMER_REGISTER_BODY,
        undefined,
        expect.anything(),
      );
    });
  });

  describe("when registration fails", () => {
    it("should set isError when authService.register rejects", async () => {
      const error = new Error("Email already in use");
      mockedAuthService.register.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CONSUMER_REGISTER_BODY);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
      expect(result.current.data).toBeUndefined();
    });

    it("should invoke onError callback when mutation fails", async () => {
      const error = new Error("Network error");
      mockedAuthService.register.mockRejectedValueOnce(error);
      const onError = jest.fn();

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CONSUMER_REGISTER_BODY, { onError });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        error,
        CONSUMER_REGISTER_BODY,
        undefined,
        expect.anything(),
      );
    });
  });

  it("should start in idle state before mutate is called", () => {
    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper().wrapper,
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useLogin", () => {
  describe("when login succeeds", () => {
    it("should return LoginResponse on success", async () => {
      mockedAuthService.login.mockResolvedValueOnce(LOGIN_RESPONSE);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(LOGIN_BODY);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(LOGIN_RESPONSE);
      expect(mockedAuthService.login).toHaveBeenCalledTimes(1);
      expect(mockedAuthService.login).toHaveBeenCalledWith(
        LOGIN_BODY,
        expect.anything(),
      );
    });

    it("should include user data with correct role in response", async () => {
      const commerceLoginResponse: LoginResponse = {
        ...LOGIN_RESPONSE,
        user: { ...LOGIN_RESPONSE.user, role: "COMERCIO", has_address: true },
      };
      mockedAuthService.login.mockResolvedValueOnce(commerceLoginResponse);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(LOGIN_BODY);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.user.role).toBe("COMERCIO");
      expect(result.current.data?.user.has_address).toBe(true);
    });

    it("should invoke onSuccess callback with LoginResponse", async () => {
      mockedAuthService.login.mockResolvedValueOnce(LOGIN_RESPONSE);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(LOGIN_BODY, { onSuccess });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalledWith(
        LOGIN_RESPONSE,
        LOGIN_BODY,
        undefined,
        expect.anything(),
      );
    });
  });

  describe("when login fails", () => {
    it("should set isError with invalid credentials", async () => {
      const error = new Error("Invalid credentials");
      mockedAuthService.login.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(LOGIN_BODY);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Invalid credentials");
    });
  });

  it("should start in idle state", () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper().wrapper,
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useLogout", () => {
  describe("when logout succeeds", () => {
    it("should call authService.logout and resolve void", async () => {
      mockedAuthService.logout.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedAuthService.logout).toHaveBeenCalledTimes(1);
    });

    it("should invoke onSuccess callback after logout", async () => {
      mockedAuthService.logout.mockResolvedValueOnce(undefined);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(undefined, { onSuccess });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  describe("when logout fails", () => {
    it("should set isError when authService.logout rejects", async () => {
      const error = new Error("Session not found");
      mockedAuthService.logout.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(error);
    });
  });

  it("should start in idle state", () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper().wrapper,
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });
});

describe("useRefreshToken", () => {
  describe("when refresh succeeds", () => {
    it("should return a new access_token on success", async () => {
      const refreshResponse = { access_token: "new-access-token-999" };
      mockedAuthService.refresh.mockResolvedValueOnce(refreshResponse);

      const { result } = renderHook(() => useRefreshToken(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(refreshResponse);
      expect(mockedAuthService.refresh).toHaveBeenCalledTimes(1);
    });

    it("should invoke onSuccess callback with new token", async () => {
      const refreshResponse = { access_token: "new-access-token-999" };
      mockedAuthService.refresh.mockResolvedValueOnce(refreshResponse);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useRefreshToken(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(undefined, { onSuccess });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalledWith(
        refreshResponse,
        undefined,
        undefined,
        expect.anything(),
      );
    });
  });

  describe("when refresh fails", () => {
    it("should set isError when authService.refresh rejects", async () => {
      const error = new Error("Refresh token expired");
      mockedAuthService.refresh.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useRefreshToken(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Refresh token expired");
    });
  });

  it("should start in idle state", () => {
    const { result } = renderHook(() => useRefreshToken(), {
      wrapper: createWrapper().wrapper,
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe("useChangePassword", () => {
  describe("when change password succeeds", () => {
    it("should call authService.changePassword with correct body", async () => {
      const successResponse = { message: "Password updated successfully" };
      mockedAuthService.changePassword.mockResolvedValueOnce(successResponse);

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CHANGE_PASSWORD_BODY);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedAuthService.changePassword).toHaveBeenCalledTimes(1);
      expect(mockedAuthService.changePassword).toHaveBeenCalledWith(
        CHANGE_PASSWORD_BODY,
        expect.anything(),
      );
      expect(result.current.data).toEqual(successResponse);
    });

    it("should invoke onSuccess callback with message response", async () => {
      const successResponse = { message: "Password updated successfully" };
      mockedAuthService.changePassword.mockResolvedValueOnce(successResponse);
      const onSuccess = jest.fn();

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CHANGE_PASSWORD_BODY, { onSuccess });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccess).toHaveBeenCalledWith(
        successResponse,
        CHANGE_PASSWORD_BODY,
        undefined,
        expect.anything(),
      );
    });
  });

  describe("when change password fails", () => {
    it("should set isError when current password is wrong", async () => {
      const error = new Error("Current password is incorrect");
      mockedAuthService.changePassword.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CHANGE_PASSWORD_BODY);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe(
        "Current password is incorrect",
      );
    });

    it("should invoke onError callback on failure", async () => {
      const error = new Error("Passwords do not match");
      mockedAuthService.changePassword.mockRejectedValueOnce(error);
      const onError = jest.fn();

      const { result } = renderHook(() => useChangePassword(), {
        wrapper: createWrapper().wrapper,
      });

      result.current.mutate(CHANGE_PASSWORD_BODY, { onError });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(onError).toHaveBeenCalledWith(
        error,
        CHANGE_PASSWORD_BODY,
        undefined,
        expect.anything(),
      );
    });
  });

  it("should start in idle state", () => {
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: createWrapper().wrapper,
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
