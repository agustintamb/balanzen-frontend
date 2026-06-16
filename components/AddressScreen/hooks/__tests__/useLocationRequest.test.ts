import * as Location from "expo-location";
import { act, renderHook } from "@testing-library/react-native";
import type { AddressInput } from "@/api/addresses/addresses.types";
import { useLocationRequest } from "@/components/AddressScreen/hooks/useLocationRequest";
import { buildAddressFromCoords } from "@/utils/address";

jest.useFakeTimers();

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Low: 3 },
}));

jest.mock("@/utils/address", () => ({
  buildAddressFromCoords: jest.fn(),
}));

const mockRequestForegroundPermissions =
  Location.requestForegroundPermissionsAsync as jest.MockedFunction<
    typeof Location.requestForegroundPermissionsAsync
  >;
const mockGetLastKnownPosition =
  Location.getLastKnownPositionAsync as jest.MockedFunction<
    typeof Location.getLastKnownPositionAsync
  >;
const mockGetCurrentPosition =
  Location.getCurrentPositionAsync as jest.MockedFunction<
    typeof Location.getCurrentPositionAsync
  >;
const mockBuildAddressFromCoords = buildAddressFromCoords as jest.MockedFunction<
  typeof buildAddressFromCoords
>;

const buildLocationResult = (lat = -34.6037, lng = -58.3816) =>
  ({
    coords: {
      latitude: lat,
      longitude: lng,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
    mocked: false,
  }) as unknown as Location.LocationObject;

const buildPermissionResponse = (
  granted: boolean,
  canAskAgain = true,
): Location.LocationPermissionResponse =>
  ({
    status: granted
      ? ("granted" as Location.PermissionStatus)
      : ("denied" as Location.PermissionStatus),
    granted,
    canAskAgain,
    expires: "never",
  }) as Location.LocationPermissionResponse;

const buildAddressInput = (
  overrides: Partial<AddressInput> = {},
): AddressInput => ({
  formatted_address: "Av. Corrientes 1234, Buenos Aires",
  street: "Av. Corrientes",
  number: "1234",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6037,
  lng: -58.3816,
  ...overrides,
});

describe("useLocationRequest", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe("initial state", () => {
    it("should have isGettingLocation=false, permissionDenied=false, locationError=null", () => {
      const { result } = renderHook(() => useLocationRequest());

      expect(result.current.isGettingLocation).toBe(false);
      expect(result.current.permissionDenied).toBe(false);
      expect(result.current.locationError).toBeNull();
    });
  });

  describe("handleUseCurrentLocation — permission denied", () => {
    it("should set permissionDenied=true when permission is denied", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce(
        buildPermissionResponse(false, true),
      );

      const { result } = renderHook(() => useLocationRequest());

      await act(async () => {
        await result.current.handleUseCurrentLocation(jest.fn());
      });

      expect(result.current.permissionDenied).toBe(true);
    });

    it("should set locationError when permission is denied and canAskAgain=false", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce(
        buildPermissionResponse(false, false),
      );

      const { result } = renderHook(() => useLocationRequest());

      await act(async () => {
        await result.current.handleUseCurrentLocation(jest.fn());
      });

      expect(result.current.locationError).not.toBeNull();
      expect(result.current.locationError).toMatch(/ubicación/i);
    });
  });

  describe("handleUseCurrentLocation — location obtained", () => {
    it("should call onSuccess with address when location is obtained via getLastKnownPositionAsync", async () => {
      const onSuccessMock = jest.fn();
      const addressInput = buildAddressInput();

      mockRequestForegroundPermissions.mockResolvedValueOnce(
        buildPermissionResponse(true),
      );
      mockGetLastKnownPosition.mockResolvedValueOnce(
        buildLocationResult(-34.6037, -58.3816),
      );
      mockBuildAddressFromCoords.mockResolvedValueOnce(addressInput);

      const { result } = renderHook(() => useLocationRequest());

      await act(async () => {
        await result.current.handleUseCurrentLocation(onSuccessMock);
      });

      expect(onSuccessMock).toHaveBeenCalledWith(
        addressInput,
        expect.objectContaining({
          latitude: -34.6037,
          longitude: -58.3816,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }),
      );
    });

    it("should fall back to getCurrentPositionAsync when getLastKnownPositionAsync returns null", async () => {
      const onSuccessMock = jest.fn();
      const addressInput = buildAddressInput({ lat: -34.9, lng: -57.9 });

      mockRequestForegroundPermissions.mockResolvedValueOnce(
        buildPermissionResponse(true),
      );
      mockGetLastKnownPosition.mockResolvedValueOnce(null);
      mockGetCurrentPosition.mockResolvedValueOnce(
        buildLocationResult(-34.9, -57.9),
      );
      mockBuildAddressFromCoords.mockResolvedValueOnce(addressInput);

      const { result } = renderHook(() => useLocationRequest());

      await act(async () => {
        await result.current.handleUseCurrentLocation(onSuccessMock);
      });

      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(onSuccessMock).toHaveBeenCalled();
    });

    it("should set isGettingLocation back to false after successful location fetch", async () => {
      const addressInput = buildAddressInput();

      mockRequestForegroundPermissions.mockResolvedValueOnce(
        buildPermissionResponse(true),
      );
      mockGetLastKnownPosition.mockResolvedValueOnce(
        buildLocationResult(-34.6037, -58.3816),
      );
      mockBuildAddressFromCoords.mockResolvedValueOnce(addressInput);

      const { result } = renderHook(() => useLocationRequest());

      await act(async () => {
        await result.current.handleUseCurrentLocation(jest.fn());
      });

      expect(result.current.isGettingLocation).toBe(false);
    });
  });

  describe("handleUseCurrentLocation — error handling", () => {
    it("should set locationError when an exception is thrown", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce(
        buildPermissionResponse(true),
      );
      mockGetLastKnownPosition.mockResolvedValueOnce(null);
      mockGetCurrentPosition.mockRejectedValueOnce(new Error("GPS failure"));

      const { result } = renderHook(() => useLocationRequest());

      await act(async () => {
        await result.current.handleUseCurrentLocation(jest.fn());
      });

      expect(result.current.locationError).not.toBeNull();
      expect(result.current.locationError).toMatch(/ubicación/i);
      expect(result.current.isGettingLocation).toBe(false);
    });
  });

  describe("handleUseCurrentLocation — no-op guard", () => {
    it("should do nothing if isGettingLocation is already true", async () => {
      mockRequestForegroundPermissions.mockResolvedValue(
        buildPermissionResponse(true),
      );
      mockGetLastKnownPosition.mockReturnValueOnce(new Promise(() => {}));

      const { result } = renderHook(() => useLocationRequest());

      await act(async () => {
        result.current.handleUseCurrentLocation(jest.fn());
        await Promise.resolve();
      });

      expect(result.current.isGettingLocation).toBe(true);

      await act(async () => {
        result.current.handleUseCurrentLocation(jest.fn());
        await Promise.resolve();
      });

      expect(mockRequestForegroundPermissions).toHaveBeenCalledTimes(1);
    });
  });
});
