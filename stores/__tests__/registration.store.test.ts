import {
  PersonalData,
  useRegistrationStore,
} from "@/stores/registration.store";

const buildPersonalData = (
  overrides?: Partial<PersonalData>,
): PersonalData => ({
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan.perez@example.com",
  password: "SecurePass123!",
  phone: "1123456789",
  dni: "12345678",
  ...overrides,
});

describe("useRegistrationStore", () => {
  beforeEach(() => {
    useRegistrationStore.setState({ personalData: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have personalData as null by default", () => {
      const { personalData } = useRegistrationStore.getState();

      expect(personalData).toBeNull();
    });

    it("should expose setPersonalData as a function", () => {
      const { setPersonalData } = useRegistrationStore.getState();

      expect(typeof setPersonalData).toBe("function");
    });

    it("should expose clear as a function", () => {
      const { clear } = useRegistrationStore.getState();

      expect(typeof clear).toBe("function");
    });
  });

  describe("setPersonalData", () => {
    it("should store personal data correctly", () => {
      const data = buildPersonalData();

      useRegistrationStore.getState().setPersonalData(data);

      expect(useRegistrationStore.getState().personalData).toEqual(data);
    });

    it("should store all fields of PersonalData", () => {
      const data = buildPersonalData({
        firstName: "María",
        lastName: "González",
        email: "maria@example.com",
        password: "MyPass456!",
        phone: "1187654321",
        dni: "87654321",
      });

      useRegistrationStore.getState().setPersonalData(data);

      const stored = useRegistrationStore.getState().personalData;
      expect(stored?.firstName).toBe("María");
      expect(stored?.lastName).toBe("González");
      expect(stored?.email).toBe("maria@example.com");
      expect(stored?.password).toBe("MyPass456!");
      expect(stored?.phone).toBe("1187654321");
      expect(stored?.dni).toBe("87654321");
    });

    it("should overwrite previous personalData with new value", () => {
      const firstData = buildPersonalData({ email: "first@example.com" });
      const secondData = buildPersonalData({ email: "second@example.com" });

      useRegistrationStore.getState().setPersonalData(firstData);
      useRegistrationStore.getState().setPersonalData(secondData);

      expect(useRegistrationStore.getState().personalData?.email).toBe(
        "second@example.com",
      );
    });

    it("should not merge with previous data — replaces the whole object", () => {
      const firstData = buildPersonalData({
        firstName: "Carlos",
        lastName: "Rodríguez",
      });
      const secondData = buildPersonalData({
        firstName: "Ana",
        lastName: "López",
      });

      useRegistrationStore.getState().setPersonalData(firstData);
      useRegistrationStore.getState().setPersonalData(secondData);

      const stored = useRegistrationStore.getState().personalData;
      expect(stored?.firstName).toBe("Ana");
      expect(stored?.lastName).toBe("López");
    });

    it("should transition personalData from null to a value", () => {
      expect(useRegistrationStore.getState().personalData).toBeNull();

      useRegistrationStore.getState().setPersonalData(buildPersonalData());

      expect(useRegistrationStore.getState().personalData).not.toBeNull();
    });

    it("should store a reference-equal object to what was passed in", () => {
      const data = buildPersonalData();

      useRegistrationStore.getState().setPersonalData(data);

      expect(useRegistrationStore.getState().personalData).toEqual(data);
    });
  });

  describe("clear", () => {
    it("should reset personalData to null after it was set", () => {
      useRegistrationStore.getState().setPersonalData(buildPersonalData());
      expect(useRegistrationStore.getState().personalData).not.toBeNull();

      useRegistrationStore.getState().clear();

      expect(useRegistrationStore.getState().personalData).toBeNull();
    });

    it("should be idempotent — calling clear when already null keeps null", () => {
      expect(useRegistrationStore.getState().personalData).toBeNull();

      useRegistrationStore.getState().clear();

      expect(useRegistrationStore.getState().personalData).toBeNull();
    });

    it("should clear data regardless of what was stored", () => {
      const data = buildPersonalData({
        firstName: "Test",
        email: "test@example.com",
        dni: "99999999",
      });

      useRegistrationStore.getState().setPersonalData(data);
      useRegistrationStore.getState().clear();

      expect(useRegistrationStore.getState().personalData).toBeNull();
    });
  });

  describe("state isolation between tests", () => {
    it("should start clean after a previous test set data — first test", () => {
      useRegistrationStore.getState().setPersonalData(buildPersonalData());

      expect(useRegistrationStore.getState().personalData).not.toBeNull();
    });

    it("should start clean after a previous test set data — second test verifies isolation", () => {
      // beforeEach resets state, so this test always starts with null
      expect(useRegistrationStore.getState().personalData).toBeNull();
    });

    it("should not share state between independent set and clear sequences", () => {
      useRegistrationStore
        .getState()
        .setPersonalData(buildPersonalData({ email: "a@example.com" }));
      useRegistrationStore.getState().clear();

      useRegistrationStore
        .getState()
        .setPersonalData(buildPersonalData({ email: "b@example.com" }));

      expect(useRegistrationStore.getState().personalData?.email).toBe(
        "b@example.com",
      );
    });
  });
});
