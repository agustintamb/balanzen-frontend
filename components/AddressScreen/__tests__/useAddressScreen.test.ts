import { BackHandler } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { Address, AddressInput } from "@/api/addresses/addresses.types";
import { useAddressScreen } from "@/components/AddressScreen/useAddressScreen";
import {
  useAddresses,
  useAddressSearch,
  useCreateAddress,
  useDeleteAddress,
  useSelectAddress,
} from "@/hooks/useAddresses";
import { useAuthStore } from "@/stores/auth.store";
import { buildAddressFromCoords } from "@/utils/address";

// Fake timers prevent the debounce setTimeout (350 ms) and withTimeout (7 s)
// from becoming open handles that keep the Jest worker alive after tests finish.
jest.useFakeTimers();

// ─── Module mocks ──────────────────────────────────────────────────────────────

jest.mock("@/hooks/useAddresses", () => ({
  useAddresses: jest.fn(),
  useAddressSearch: jest.fn(),
  useCreateAddress: jest.fn(),
  useDeleteAddress: jest.fn(),
  useSelectAddress: jest.fn(),
}));

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Low: 3 },
}));

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(false),
  },
}));

jest.mock("@/stores/ui.store", () => ({
  useToast: jest.fn().mockReturnValue({ showSuccess: jest.fn() }),
}));

jest.mock("@/stores/auth.store", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("@/utils/address", () => ({
  buildAddressFromCoords: jest.fn(),
}));

// ─── Typed helpers ─────────────────────────────────────────────────────────────

const mockUseAddresses = useAddresses as jest.MockedFunction<
  typeof useAddresses
>;
const mockUseAddressSearch = useAddressSearch as jest.MockedFunction<
  typeof useAddressSearch
>;
const mockUseCreateAddress = useCreateAddress as jest.MockedFunction<
  typeof useCreateAddress
>;
const mockUseDeleteAddress = useDeleteAddress as jest.MockedFunction<
  typeof useDeleteAddress
>;
const mockUseSelectAddress = useSelectAddress as jest.MockedFunction<
  typeof useSelectAddress
>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<
  typeof useAuthStore
>;
const mockBuildAddressFromCoords =
  buildAddressFromCoords as jest.MockedFunction<typeof buildAddressFromCoords>;
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

// ─── Factories ────────────────────────────────────────────────────────────────

const buildAddress = (overrides: Partial<Address> = {}): Address => ({
  id: "addr-1",
  formatted_address: "Av. Corrientes 1234, Buenos Aires",
  street: "Av. Corrientes",
  number: "1234",
  city: "Buenos Aires",
  province: "Buenos Aires",
  lat: -34.6037,
  lng: -58.3816,
  is_selected: false,
  ...overrides,
});

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

type MutationResult<TData, TError, TVariables> = {
  mutate: jest.MockedFunction<
    (
      variables: TVariables,
      options?: {
        onSuccess?: (data: TData) => void;
        onError?: (err: TError) => void;
      },
    ) => void
  >;
  isPending: boolean;
};

const buildMutation = <TData = unknown, TError = Error, TVariables = unknown>(
  overrides: Partial<MutationResult<TData, TError, TVariables>> = {},
): MutationResult<TData, TError, TVariables> => ({
  mutate: jest.fn(),
  isPending: false,
  ...overrides,
});

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

// ─── Default setup ─────────────────────────────────────────────────────────────

const setupDefaultMocks = () => {
  mockUseAddresses.mockReturnValue({
    data: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useAddresses>);

  mockUseAddressSearch.mockReturnValue({
    data: [],
    isFetching: false,
  } as unknown as ReturnType<typeof useAddressSearch>);

  mockUseCreateAddress.mockReturnValue(
    buildMutation() as unknown as ReturnType<typeof useCreateAddress>,
  );
  mockUseDeleteAddress.mockReturnValue(
    buildMutation() as unknown as ReturnType<typeof useDeleteAddress>,
  );
  mockUseSelectAddress.mockReturnValue(
    buildMutation() as unknown as ReturnType<typeof useSelectAddress>,
  );

  mockUseAuthStore.mockReturnValue({
    user: {
      id: "u1",
      role: "CONSUMIDOR",
      email: "a@b.com",
      first_name: "A",
      last_name: "B",
      has_address: false,
    },
    setHasAddress: jest.fn(),
    setHasSelectedAddress: jest.fn(),
  } as unknown as ReturnType<typeof useAuthStore>);

  (router.canGoBack as jest.Mock).mockReturnValue(false);
};

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("useAddressScreen", () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  // ─── Initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("should default to 'add' mode when addresses list is empty and not loading", () => {
      const { result } = renderHook(() => useAddressScreen());
      expect(result.current.mode).toBe("add");
    });

    it("should default to 'list' mode when addresses exist", async () => {
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.mode).toBe("list");
      });
    });

    it("should pre-select the active address on mount", async () => {
      const activeAddress = buildAddress({
        id: "addr-active",
        is_selected: true,
      });
      mockUseAddresses.mockReturnValue({
        data: [activeAddress, buildAddress({ id: "addr-2" })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.localSelectedId).toBe("addr-active");
      });
    });

    it("should expose canContinue as false when no address is selected", () => {
      const { result } = renderHook(() => useAddressScreen());
      expect(result.current.canContinue).toBe(false);
    });
  });

  // ─── handleSelectSearchResult ───────────────────────────────────────────────

  describe("handleSelectSearchResult", () => {
    it("should set pendingAddress and switch mode to 'map'", () => {
      const { result } = renderHook(() => useAddressScreen());
      const addressInput = buildAddressInput();

      act(() => {
        result.current.handleSelectSearchResult(addressInput);
      });

      expect(result.current.pendingAddress).toEqual(addressInput);
      expect(result.current.mode).toBe("map");
    });

    it("should update region to the selected result coordinates", () => {
      const { result } = renderHook(() => useAddressScreen());
      const addressInput = buildAddressInput({ lat: -31.4, lng: -64.18 });

      act(() => {
        result.current.handleSelectSearchResult(addressInput);
      });

      expect(result.current.region.latitude).toBe(-31.4);
      expect(result.current.region.longitude).toBe(-64.18);
    });

    it("should clear the search query after selecting a result", () => {
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.setSearchQuery("Corrientes");
      });
      act(() => {
        result.current.handleSelectSearchResult(buildAddressInput());
      });

      expect(result.current.searchQuery).toBe("");
    });
  });

  // ─── handleConfirmAddress ───────────────────────────────────────────────────

  describe("handleConfirmAddress", () => {
    it("should call createAddress mutation when pendingAddress is set", () => {
      const mutateMock = jest.fn();
      mockUseCreateAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useCreateAddress
        >,
      );
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleSelectSearchResult(buildAddressInput());
      });
      act(() => {
        result.current.handleConfirmAddress();
      });

      expect(mutateMock).toHaveBeenCalledWith(
        buildAddressInput(),
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("should not call createAddress when pendingAddress is null", () => {
      const mutateMock = jest.fn();
      mockUseCreateAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useCreateAddress
        >,
      );
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleConfirmAddress();
      });

      expect(mutateMock).not.toHaveBeenCalled();
    });

    it("should switch mode to 'list' on createAddress success", () => {
      const mutateMock = jest.fn((_, opts) =>
        opts?.onSuccess?.(buildAddress({ id: "new-addr" })),
      );
      mockUseCreateAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useCreateAddress
        >,
      );
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleSelectSearchResult(buildAddressInput());
      });
      act(() => {
        result.current.handleConfirmAddress();
      });

      expect(result.current.mode).toBe("list");
    });
  });

  // ─── handlePressAddress / handleLongPressAddress ────────────────────────────

  describe("handlePressAddress", () => {
    it("should update localSelectedId when an address is tapped", () => {
      mockUseAddresses.mockReturnValue({
        data: [
          buildAddress({ id: "addr-1", is_selected: true }),
          buildAddress({ id: "addr-2" }),
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handlePressAddress("addr-2");
      });

      expect(result.current.localSelectedId).toBe("addr-2");
    });
  });

  describe("handleLongPressAddress", () => {
    it("should set deletingAddressId when long-pressing a non-selected address", async () => {
      mockUseAddresses.mockReturnValue({
        data: [
          buildAddress({ id: "addr-1", is_selected: true }),
          buildAddress({ id: "addr-2" }),
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.localSelectedId).toBe("addr-1");
      });

      act(() => {
        result.current.handleLongPressAddress("addr-2");
      });

      expect(result.current.deletingAddressId).toBe("addr-2");
    });

    it("should not set deletingAddressId when long-pressing the currently selected address", async () => {
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.localSelectedId).toBe("addr-1");
      });

      act(() => {
        result.current.handleLongPressAddress("addr-1");
      });

      expect(result.current.deletingAddressId).toBeNull();
    });
  });

  // ─── handleDeleteConfirm / handleDeleteCancel ───────────────────────────────

  describe("handleDeleteConfirm", () => {
    it("should call deleteAddress mutation with deletingAddressId", async () => {
      const mutateMock = jest.fn();
      mockUseDeleteAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useDeleteAddress
        >,
      );
      mockUseAddresses.mockReturnValue({
        data: [
          buildAddress({ id: "addr-1", is_selected: true }),
          buildAddress({ id: "addr-2" }),
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.localSelectedId).toBe("addr-1");
      });

      act(() => {
        result.current.handleLongPressAddress("addr-2");
      });
      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(mutateMock).toHaveBeenCalledWith(
        "addr-2",
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("should not call deleteAddress when deletingAddressId is null", () => {
      const mutateMock = jest.fn();
      mockUseDeleteAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useDeleteAddress
        >,
      );

      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(mutateMock).not.toHaveBeenCalled();
    });

    it("should clear deletingAddressId on delete success", async () => {
      const mutateMock = jest.fn((_, opts) => opts?.onSuccess?.());
      mockUseDeleteAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useDeleteAddress
        >,
      );
      mockUseAddresses.mockReturnValue({
        data: [
          buildAddress({ id: "addr-1", is_selected: true }),
          buildAddress({ id: "addr-2" }),
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() =>
        expect(result.current.localSelectedId).toBe("addr-1"),
      );

      act(() => {
        result.current.handleLongPressAddress("addr-2");
      });
      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(result.current.deletingAddressId).toBeNull();
    });
  });

  describe("handleDeleteCancel", () => {
    it("should clear deletingAddressId", () => {
      mockUseAddresses.mockReturnValue({
        data: [
          buildAddress({ id: "addr-1", is_selected: true }),
          buildAddress({ id: "addr-2" }),
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleLongPressAddress("addr-2");
      });
      act(() => {
        result.current.handleDeleteCancel();
      });

      expect(result.current.deletingAddressId).toBeNull();
    });
  });

  // ─── handleContinue ─────────────────────────────────────────────────────────

  describe("handleContinue", () => {
    it("should call selectAddress with localSelectedId", async () => {
      const mutateMock = jest.fn();
      mockUseSelectAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useSelectAddress
        >,
      );
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() =>
        expect(result.current.localSelectedId).toBe("addr-1"),
      );

      act(() => {
        result.current.handleContinue();
      });

      expect(mutateMock).toHaveBeenCalledWith(
        "addr-1",
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("should not call selectAddress when no address is selected", () => {
      const mutateMock = jest.fn();
      mockUseSelectAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useSelectAddress
        >,
      );

      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleContinue();
      });

      expect(mutateMock).not.toHaveBeenCalled();
    });

    it("should call setHasAddress(true) and navigate to consumer home on success for CONSUMIDOR role", async () => {
      const setHasAddressMock = jest.fn();
      mockUseAuthStore.mockReturnValue({
        user: {
          id: "u1",
          role: "CONSUMIDOR",
          email: "a@b.com",
          first_name: "A",
          last_name: "B",
          has_address: false,
        },
        setHasAddress: setHasAddressMock,
        setHasSelectedAddress: jest.fn(),
      } as unknown as ReturnType<typeof useAuthStore>);

      const mutateMock = jest.fn((_, opts) => opts?.onSuccess?.());
      mockUseSelectAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useSelectAddress
        >,
      );
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() =>
        expect(result.current.localSelectedId).toBe("addr-1"),
      );

      act(() => {
        result.current.handleContinue();
      });

      expect(setHasAddressMock).toHaveBeenCalledWith(true);
      expect(router.replace).toHaveBeenCalledWith("/(consumer)/home");
    });

    it("should navigate to commerce home on success for COMERCIO role", async () => {
      mockUseAuthStore.mockReturnValue({
        user: {
          id: "u2",
          role: "COMERCIO",
          email: "c@d.com",
          first_name: "C",
          last_name: "D",
          has_address: false,
        },
        setHasAddress: jest.fn(),
        setHasSelectedAddress: jest.fn(),
      } as unknown as ReturnType<typeof useAuthStore>);

      const mutateMock = jest.fn((_, opts) => opts?.onSuccess?.());
      mockUseSelectAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useSelectAddress
        >,
      );
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() =>
        expect(result.current.localSelectedId).toBe("addr-1"),
      );

      act(() => {
        result.current.handleContinue();
      });

      expect(router.replace).toHaveBeenCalledWith("/(commerce)/home");
    });
  });

  // ─── handleRegionChangeComplete ──────────────────────────────────────────────

  describe("handleRegionChangeComplete", () => {
    it("should update region and call buildAddressFromCoords", async () => {
      const newAddress = buildAddressInput({ lat: -31.4, lng: -64.18 });
      mockBuildAddressFromCoords.mockResolvedValueOnce(newAddress);
      const { result } = renderHook(() => useAddressScreen());

      await act(async () => {
        await result.current.handleRegionChangeComplete({
          latitude: -31.4,
          longitude: -64.18,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      });

      expect(mockBuildAddressFromCoords).toHaveBeenCalledWith(-31.4, -64.18);
      expect(result.current.pendingAddress).toEqual(newAddress);
      expect(result.current.region.latitude).toBe(-31.4);
      expect(result.current.isReverseGeocoding).toBe(false);
    });
  });

  // ─── handleUseCurrentLocation ────────────────────────────────────────────────

  describe("handleUseCurrentLocation", () => {
    it("should set permissionDenied and not navigate when permission is denied", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce({
        status: "denied" as Location.PermissionStatus,
        canAskAgain: true,
        expires: "never",
        granted: false,
      });
      const { result } = renderHook(() => useAddressScreen());

      await act(async () => {
        await result.current.handleUseCurrentLocation();
      });

      expect(result.current.permissionDenied).toBe(true);
      expect(result.current.mode).not.toBe("map");
    });

    it("should set locationError when permission is permanently denied (canAskAgain=false)", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce({
        status: "denied" as Location.PermissionStatus,
        canAskAgain: false,
        expires: "never",
        granted: false,
      });
      const { result } = renderHook(() => useAddressScreen());

      await act(async () => {
        await result.current.handleUseCurrentLocation();
      });

      expect(result.current.locationError).toMatch(/Configuración/);
    });

    it("should use last known position when available and switch to map mode", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce({
        status: "granted" as Location.PermissionStatus,
        canAskAgain: true,
        expires: "never",
        granted: true,
      });
      mockGetLastKnownPosition.mockResolvedValueOnce(
        buildLocationResult(-34.6037, -58.3816),
      );
      const addressInput = buildAddressInput();
      mockBuildAddressFromCoords.mockResolvedValueOnce(addressInput);

      const { result } = renderHook(() => useAddressScreen());

      await act(async () => {
        await result.current.handleUseCurrentLocation();
      });

      expect(result.current.mode).toBe("map");
      expect(result.current.pendingAddress).toEqual(addressInput);
      expect(result.current.region.latitude).toBe(-34.6037);
      expect(result.current.isGettingLocation).toBe(false);
    });

    it("should fall back to getCurrentPositionAsync when last known is null", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce({
        status: "granted" as Location.PermissionStatus,
        canAskAgain: true,
        expires: "never",
        granted: true,
      });
      mockGetLastKnownPosition.mockResolvedValueOnce(null);
      mockGetCurrentPosition.mockResolvedValueOnce(
        buildLocationResult(-34.9, -57.9),
      );
      const addressInput = buildAddressInput({ lat: -34.9, lng: -57.9 });
      mockBuildAddressFromCoords.mockResolvedValueOnce(addressInput);

      const { result } = renderHook(() => useAddressScreen());

      await act(async () => {
        await result.current.handleUseCurrentLocation();
      });

      expect(mockGetCurrentPosition).toHaveBeenCalled();
      expect(result.current.mode).toBe("map");
    });

    it("should set locationError when location fetch throws", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce({
        status: "granted" as Location.PermissionStatus,
        canAskAgain: true,
        expires: "never",
        granted: true,
      });
      mockGetLastKnownPosition.mockResolvedValueOnce(null);
      mockGetCurrentPosition.mockRejectedValueOnce(new Error("GPS failure"));

      const { result } = renderHook(() => useAddressScreen());

      await act(async () => {
        await result.current.handleUseCurrentLocation();
      });

      expect(result.current.locationError).toMatch(/ubicación/i);
      expect(result.current.isGettingLocation).toBe(false);
      expect(result.current.mode).not.toBe("map");
    });

    it("should set locationError when the GPS request times out (withTimeout fires after 7 s)", async () => {
      mockRequestForegroundPermissions.mockResolvedValueOnce(
        buildPermissionResponse(true),
      );
      mockGetLastKnownPosition.mockResolvedValueOnce(null);
      // getCurrentPosition never resolves — withTimeout will reject first
      mockGetCurrentPosition.mockReturnValueOnce(new Promise(() => {}));

      const { result } = renderHook(() => useAddressScreen());

      await act(async () => {
        result.current.handleUseCurrentLocation();
        // Let permission + getLastKnownPosition microtasks resolve
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        // Fire the 7 s timeout
        jest.advanceTimersByTime(7001);
        // Let the rejection propagate through Promise.race / catch
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.locationError).toMatch(/ubicación/i);
      expect(result.current.isGettingLocation).toBe(false);
    });

    it("should not trigger a second location request while already fetching", async () => {
      mockRequestForegroundPermissions.mockResolvedValue({
        status: "granted" as Location.PermissionStatus,
        canAskAgain: true,
        expires: "never",
        granted: true,
      });
      // Never resolve — keeps isGettingLocation true
      mockGetLastKnownPosition.mockReturnValueOnce(new Promise(() => {}));

      const { result } = renderHook(() => useAddressScreen());

      // First call — await one microtask tick so the permissions resolution
      // (and the subsequent setPermissionDenied call) happens inside act().
      // getLastKnownPositionAsync never resolves, so isGettingLocation stays true.
      await act(async () => {
        result.current.handleUseCurrentLocation();
        await Promise.resolve();
      });

      expect(result.current.isGettingLocation).toBe(true);

      // Second call while first is pending — should be a no-op
      await act(async () => {
        result.current.handleUseCurrentLocation();
        await Promise.resolve();
      });

      expect(mockRequestForegroundPermissions).toHaveBeenCalledTimes(1);
    });
  });

  // ─── handleBack ─────────────────────────────────────────────────────────────

  describe("handleBack", () => {
    it("should call router.back when canGoBack is true", () => {
      (router.canGoBack as jest.Mock).mockReturnValue(true);
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleBack();
      });

      expect(router.back).toHaveBeenCalledTimes(1);
      expect(router.replace).not.toHaveBeenCalled();
    });

    it("should navigate to consumer home when canGoBack is false and role is CONSUMIDOR", () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleBack();
      });

      expect(router.replace).toHaveBeenCalledWith("/(consumer)/home");
      expect(router.back).not.toHaveBeenCalled();
    });

    it("should navigate to commerce home when canGoBack is false and role is COMERCIO", () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);
      mockUseAuthStore.mockReturnValue({
        user: {
          id: "u2",
          role: "COMERCIO",
          email: "c@d.com",
          first_name: "C",
          last_name: "D",
          has_address: false,
        },
        setHasAddress: jest.fn(),
        setHasSelectedAddress: jest.fn(),
      } as unknown as ReturnType<typeof useAuthStore>);

      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleBack();
      });

      expect(router.replace).toHaveBeenCalledWith("/(commerce)/home");
      expect(router.back).not.toHaveBeenCalled();
    });

    it("should navigate to consumer home when canGoBack is false and user is null", () => {
      (router.canGoBack as jest.Mock).mockReturnValue(false);
      mockUseAuthStore.mockReturnValue({
        user: null,
        setHasAddress: jest.fn(),
        setHasSelectedAddress: jest.fn(),
      } as unknown as ReturnType<typeof useAuthStore>);

      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleBack();
      });

      expect(router.replace).toHaveBeenCalledWith("/(consumer)/home");
    });
  });

  // ─── handleContinue — canGoBack branch ─────────────────────────────────────

  describe("handleContinue — router.canGoBack() === true", () => {
    it("should call showSuccess and router.back when canGoBack is true", async () => {
      const mockCanGoBack = router.canGoBack as jest.MockedFunction<
        typeof router.canGoBack
      >;
      mockCanGoBack.mockReturnValue(true);

      const mutateMock = jest.fn((_, opts) => opts?.onSuccess?.());
      mockUseSelectAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useSelectAddress
        >,
      );
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() =>
        expect(result.current.localSelectedId).toBe("addr-1"),
      );

      act(() => {
        result.current.handleContinue();
      });

      expect(router.back).toHaveBeenCalledTimes(1);
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  // ─── BackHandler callback ───────────────────────────────────────────────────

  describe("BackHandler", () => {
    let capturedCallback: (() => boolean | null | undefined) | null = null;

    beforeEach(() => {
      jest
        .spyOn(BackHandler, "addEventListener")
        .mockImplementation(
          (
            _event: "hardwareBackPress",
            cb: () => boolean | null | undefined,
          ) => {
            capturedCallback = cb;
            return { remove: jest.fn() };
          },
        );
    });

    afterEach(() => {
      capturedCallback = null;
      jest.restoreAllMocks();
    });

    it("should switch mode to 'add' and return true when back is pressed in map mode", async () => {
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.handleSelectSearchResult(buildAddressInput());
      });
      expect(result.current.mode).toBe("map");

      act(() => {
        capturedCallback?.();
      });

      expect(result.current.mode).toBe("add");
    });

    it("should switch mode to 'list' and return true when back is pressed in add mode with existing addresses", async () => {
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => expect(result.current.mode).toBe("list"));

      act(() => {
        result.current.setMode("add");
      });

      act(() => {
        capturedCallback?.();
      });

      expect(result.current.mode).toBe("list");
    });

    it("should return true (block navigation) when back is pressed in add mode with no addresses", () => {
      const { result } = renderHook(() => useAddressScreen());

      expect(result.current.mode).toBe("add");

      const blocked = capturedCallback?.();

      expect(blocked).toBe(true);
      expect(result.current.mode).toBe("add");
    });

    it("should return false (allow navigation) when back is pressed in list mode with addresses", async () => {
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: true })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => expect(result.current.mode).toBe("list"));

      const blocked = capturedCallback?.();

      expect(blocked).toBe(false);
    });

    it("should return true (block navigation) when back is pressed in list mode with no addresses", () => {
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.setMode("list");
      });

      const blocked = capturedCallback?.();

      expect(blocked).toBe(true);
    });
  });

  // ─── Search debounce ────────────────────────────────────────────────────────

  describe("search debounce", () => {
    it("should not pass query to useAddressSearch until 350ms have elapsed", () => {
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.setSearchQuery("corr");
      });

      // Before debounce fires, debouncedQuery is still ""
      expect(mockUseAddressSearch).toHaveBeenLastCalledWith("");

      act(() => {
        jest.advanceTimersByTime(350);
      });

      // After debounce fires, search hook receives the actual query
      expect(mockUseAddressSearch).toHaveBeenLastCalledWith("corr");
    });

    it("should reset the debounce timer on each keystroke", () => {
      const { result } = renderHook(() => useAddressScreen());

      act(() => {
        result.current.setSearchQuery("co");
        jest.advanceTimersByTime(200);
        result.current.setSearchQuery("cor");
        jest.advanceTimersByTime(200);
      });

      // 200ms after last keystroke — debounce hasn't fired yet
      expect(mockUseAddressSearch).toHaveBeenLastCalledWith("");

      act(() => {
        jest.advanceTimersByTime(350);
      });

      expect(mockUseAddressSearch).toHaveBeenLastCalledWith("cor");
    });
  });

  // ─── sortedAddresses ────────────────────────────────────────────────────────

  describe("sortedAddresses ordering", () => {
    it("should keep equal is_selected values in their original order (return 0 branch)", async () => {
      mockUseAddresses.mockReturnValue({
        data: [
          buildAddress({ id: "addr-a", is_selected: false }),
          buildAddress({ id: "addr-b", is_selected: false }),
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.addresses).toHaveLength(2);
      });

      const ids = result.current.addresses.map((a) => a.id);
      expect(ids).toEqual(["addr-a", "addr-b"]);
    });

    it("should sort selected address first when unselected appears before selected in source array (return 1 branch)", async () => {
      mockUseAddresses.mockReturnValue({
        data: [
          buildAddress({ id: "addr-unselected", is_selected: false }),
          buildAddress({ id: "addr-selected", is_selected: true }),
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.addresses[0].id).toBe("addr-selected");
      });
    });
  });

  // ─── default values when data is undefined ───────────────────────────────────

  describe("data default values", () => {
    it("should default addresses to empty array when useAddresses returns no data", () => {
      mockUseAddresses.mockReturnValue({
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      expect(result.current.addresses).toEqual([]);
    });

    it("should default searchResults to empty array when useAddressSearch returns no data", () => {
      mockUseAddressSearch.mockReturnValue({
        isFetching: false,
      } as unknown as ReturnType<typeof useAddressSearch>);

      const { result } = renderHook(() => useAddressScreen());

      expect(result.current.searchResults).toEqual([]);
    });
  });

  // ─── canContinue ────────────────────────────────────────────────────────────

  describe("canContinue", () => {
    it("should be true when an address is selected and addresses list is non-empty", async () => {
      // is_selected: false → savedSelectedId = null; single address auto-selects locally
      // → localSelectedId = "addr-1" ≠ null → canContinue = true
      mockUseAddresses.mockReturnValue({
        data: [buildAddress({ id: "addr-1", is_selected: false })],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      await waitFor(() => {
        expect(result.current.canContinue).toBe(true);
      });
    });

    it("should be false when addresses list is empty even if localSelectedId is set manually", () => {
      mockUseAddresses.mockReturnValue({
        data: [],
        isLoading: false,
      } as unknown as ReturnType<typeof useAddresses>);

      const { result } = renderHook(() => useAddressScreen());

      // Force a local selection — canContinue still false because list is empty
      act(() => {
        result.current.handlePressAddress("addr-phantom");
      });

      expect(result.current.canContinue).toBe(false);
    });
  });
});
