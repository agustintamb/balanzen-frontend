import type { UserRole } from "@/api/users/users.types";
import { useAuthStore, type AuthUser } from "@/stores/auth.store";

const buildAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: "user-123",
  email: "test@example.com",
  role: "CONSUMIDOR" as UserRole,
  first_name: "Juan",
  last_name: "Perez",
  has_address: false,
  photo_url: null,
  ...overrides,
});

const INITIAL_STATE = {
  user: null,
  accessToken: null,
  isInitialized: false,
};

beforeEach(() => {
  useAuthStore.setState(INITIAL_STATE);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("useAuthStore", () => {
  describe("initial state", () => {
    it("should have user as null initially", () => {
      const { user } = useAuthStore.getState();

      expect(user).toBeNull();
    });

    it("should have accessToken as null initially", () => {
      const { accessToken } = useAuthStore.getState();

      expect(accessToken).toBeNull();
    });

    it("should have isInitialized as false initially", () => {
      const { isInitialized } = useAuthStore.getState();

      expect(isInitialized).toBe(false);
    });
  });

  describe("setUser", () => {
    it("should update user when a valid AuthUser is provided", () => {
      const user = buildAuthUser();

      useAuthStore.getState().setUser(user);

      expect(useAuthStore.getState().user).toEqual(user);
    });

    it("should set user to null when null is provided", () => {
      useAuthStore.setState({ user: buildAuthUser() });

      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().user).toBeNull();
    });

    it("should overwrite an existing user with the new user", () => {
      const firstUser = buildAuthUser({
        id: "user-001",
        email: "first@example.com",
      });
      const secondUser = buildAuthUser({
        id: "user-002",
        email: "second@example.com",
      });

      useAuthStore.getState().setUser(firstUser);
      useAuthStore.getState().setUser(secondUser);

      expect(useAuthStore.getState().user).toEqual(secondUser);
    });

    it("should not affect accessToken or isInitialized when updating user", () => {
      useAuthStore.setState({ accessToken: "token-abc", isInitialized: true });
      const user = buildAuthUser();

      useAuthStore.getState().setUser(user);

      const { accessToken, isInitialized } = useAuthStore.getState();
      expect(accessToken).toBe("token-abc");
      expect(isInitialized).toBe(true);
    });

    it("should store all AuthUser fields correctly", () => {
      const user = buildAuthUser({
        id: "uuid-999",
        email: "commerce@biz.com",
        role: "COMERCIO",
        first_name: "Maria",
        last_name: "Lopez",
        has_address: true,
        photo_url: "https://cdn.example.com/photo.jpg",
      });

      useAuthStore.getState().setUser(user);

      expect(useAuthStore.getState().user).toMatchObject({
        id: "uuid-999",
        email: "commerce@biz.com",
        role: "COMERCIO",
        first_name: "Maria",
        last_name: "Lopez",
        has_address: true,
        photo_url: "https://cdn.example.com/photo.jpg",
      });
    });
  });

  describe("setAccessToken", () => {
    it("should update accessToken with the provided token string", () => {
      useAuthStore
        .getState()
        .setAccessToken("eyJhbGciOiJIUzI1NiJ9.payload.signature");

      expect(useAuthStore.getState().accessToken).toBe(
        "eyJhbGciOiJIUzI1NiJ9.payload.signature",
      );
    });

    it("should set accessToken to null when null is provided", () => {
      useAuthStore.setState({ accessToken: "some-existing-token" });

      useAuthStore.getState().setAccessToken(null);

      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("should overwrite an existing token with a new one", () => {
      useAuthStore.setState({ accessToken: "old-token" });

      useAuthStore.getState().setAccessToken("new-token");

      expect(useAuthStore.getState().accessToken).toBe("new-token");
    });

    it("should not affect user or isInitialized when updating accessToken", () => {
      const user = buildAuthUser();
      useAuthStore.setState({ user, isInitialized: true });

      useAuthStore.getState().setAccessToken("fresh-token");

      const { user: storedUser, isInitialized } = useAuthStore.getState();
      expect(storedUser).toEqual(user);
      expect(isInitialized).toBe(true);
    });
  });

  describe("setHasAddress", () => {
    it("should update has_address to true on the existing user", () => {
      const user = buildAuthUser({ has_address: false });
      useAuthStore.setState({ user });

      useAuthStore.getState().setHasAddress(true);

      expect(useAuthStore.getState().user?.has_address).toBe(true);
    });

    it("should update has_address to false on the existing user", () => {
      const user = buildAuthUser({ has_address: true });
      useAuthStore.setState({ user });

      useAuthStore.getState().setHasAddress(false);

      expect(useAuthStore.getState().user?.has_address).toBe(false);
    });

    it("should not affect other user fields when updating has_address", () => {
      const user = buildAuthUser({
        id: "user-456",
        email: "preserve@example.com",
        first_name: "Ana",
        last_name: "Garcia",
        has_address: false,
        photo_url: "https://photo.url",
      });
      useAuthStore.setState({ user });

      useAuthStore.getState().setHasAddress(true);

      const storedUser = useAuthStore.getState().user;
      expect(storedUser?.id).toBe("user-456");
      expect(storedUser?.email).toBe("preserve@example.com");
      expect(storedUser?.first_name).toBe("Ana");
      expect(storedUser?.last_name).toBe("Garcia");
      expect(storedUser?.photo_url).toBe("https://photo.url");
    });

    it("should leave user as null when called with no user in state", () => {
      useAuthStore.setState({ user: null });

      useAuthStore.getState().setHasAddress(true);

      expect(useAuthStore.getState().user).toBeNull();
    });

    it("should not affect accessToken or isInitialized when updating has_address", () => {
      const user = buildAuthUser();
      useAuthStore.setState({
        user,
        accessToken: "token-xyz",
        isInitialized: true,
      });

      useAuthStore.getState().setHasAddress(true);

      const { accessToken, isInitialized } = useAuthStore.getState();
      expect(accessToken).toBe("token-xyz");
      expect(isInitialized).toBe(true);
    });
  });

  describe("setInitialized", () => {
    it("should set isInitialized to true", () => {
      useAuthStore.getState().setInitialized();

      expect(useAuthStore.getState().isInitialized).toBe(true);
    });

    it("should remain true if called multiple times", () => {
      useAuthStore.getState().setInitialized();
      useAuthStore.getState().setInitialized();

      expect(useAuthStore.getState().isInitialized).toBe(true);
    });

    it("should not affect user or accessToken when setting initialized", () => {
      const user = buildAuthUser();
      useAuthStore.setState({ user, accessToken: "valid-token" });

      useAuthStore.getState().setInitialized();

      const { user: storedUser, accessToken } = useAuthStore.getState();
      expect(storedUser).toEqual(user);
      expect(accessToken).toBe("valid-token");
    });
  });

  describe("clear", () => {
    it("should reset user to null", () => {
      useAuthStore.setState({ user: buildAuthUser() });

      useAuthStore.getState().clear();

      expect(useAuthStore.getState().user).toBeNull();
    });

    it("should reset accessToken to null", () => {
      useAuthStore.setState({ accessToken: "some-token" });

      useAuthStore.getState().clear();

      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("should clear both user and accessToken simultaneously", () => {
      useAuthStore.setState({
        user: buildAuthUser(),
        accessToken: "active-token",
      });

      useAuthStore.getState().clear();

      const { user, accessToken } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(accessToken).toBeNull();
    });

    it("should not modify isInitialized when clearing", () => {
      useAuthStore.setState({
        user: buildAuthUser(),
        accessToken: "token",
        isInitialized: true,
      });

      useAuthStore.getState().clear();

      expect(useAuthStore.getState().isInitialized).toBe(true);
    });

    it("should be safe to call clear on an already empty store", () => {
      useAuthStore.getState().clear();

      const { user, accessToken } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(accessToken).toBeNull();
    });
  });

  describe("state isolation between tests", () => {
    it("should start with a clean slate — user null", () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("should start with a clean slate — accessToken null", () => {
      expect(useAuthStore.getState().accessToken).toBeNull();
    });

    it("should start with a clean slate — isInitialized false", () => {
      expect(useAuthStore.getState().isInitialized).toBe(false);
    });

    it("should not carry over state mutations from a previous test", () => {
      useAuthStore.getState().setUser(buildAuthUser());
      useAuthStore.getState().setAccessToken("leaked-token");
      useAuthStore.getState().setInitialized();

      // Simulating the next test: beforeEach resets state
      useAuthStore.setState(INITIAL_STATE);

      const { user, accessToken, isInitialized } = useAuthStore.getState();
      expect(user).toBeNull();
      expect(accessToken).toBeNull();
      expect(isInitialized).toBe(false);
    });
  });
});
