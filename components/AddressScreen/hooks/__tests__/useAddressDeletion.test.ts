import { act, renderHook } from "@testing-library/react-native";
import { useAddressDeletion } from "@/components/AddressScreen/hooks/useAddressDeletion";
import { useDeleteAddress } from "@/hooks/useAddresses";

jest.mock("@/hooks/useAddresses", () => ({
  useDeleteAddress: jest.fn(),
}));

const mockUseDeleteAddress = useDeleteAddress as jest.MockedFunction<
  typeof useDeleteAddress
>;

type MutationResult = {
  mutate: jest.MockedFunction<
    (
      variables: string,
      options?: { onSuccess?: () => void; onError?: (err: Error) => void },
    ) => void
  >;
  isPending: boolean;
};

const buildMutation = (
  overrides: Partial<MutationResult> = {},
): MutationResult => ({
  mutate: jest.fn(),
  isPending: false,
  ...overrides,
});

const setupDefaultMocks = () => {
  mockUseDeleteAddress.mockReturnValue(
    buildMutation() as unknown as ReturnType<typeof useDeleteAddress>,
  );
};

describe("useAddressDeletion", () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have deletingAddressId as null and isDeleting as false", () => {
      const { result } = renderHook(() => useAddressDeletion());

      expect(result.current.deletingAddressId).toBeNull();
      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe("handleLongPressAddress", () => {
    it("should set deletingAddressId when id is different from selectedId", () => {
      const { result } = renderHook(() => useAddressDeletion());

      act(() => {
        result.current.handleLongPressAddress("addr-2", "addr-1");
      });

      expect(result.current.deletingAddressId).toBe("addr-2");
    });

    it("should not set deletingAddressId when id equals selectedId", () => {
      const { result } = renderHook(() => useAddressDeletion());

      act(() => {
        result.current.handleLongPressAddress("addr-1", "addr-1");
      });

      expect(result.current.deletingAddressId).toBeNull();
    });
  });

  describe("handleDeleteCancel", () => {
    it("should reset deletingAddressId to null", () => {
      const { result } = renderHook(() => useAddressDeletion());

      act(() => {
        result.current.handleLongPressAddress("addr-2", "addr-1");
      });
      expect(result.current.deletingAddressId).toBe("addr-2");

      act(() => {
        result.current.handleDeleteCancel();
      });

      expect(result.current.deletingAddressId).toBeNull();
    });
  });

  describe("handleDeleteConfirm", () => {
    it("should call deleteAddress with the pending id", () => {
      const mutateMock = jest.fn();
      mockUseDeleteAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useDeleteAddress
        >,
      );

      const { result } = renderHook(() => useAddressDeletion());

      act(() => {
        result.current.handleLongPressAddress("addr-2", "addr-1");
      });
      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(mutateMock).toHaveBeenCalledWith(
        "addr-2",
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("should do nothing when deletingAddressId is null", () => {
      const mutateMock = jest.fn();
      mockUseDeleteAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useDeleteAddress
        >,
      );

      const { result } = renderHook(() => useAddressDeletion());

      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(mutateMock).not.toHaveBeenCalled();
    });

    it("should reset deletingAddressId to null after successful delete", () => {
      const mutateMock = jest.fn((_, opts) => opts?.onSuccess?.());
      mockUseDeleteAddress.mockReturnValue(
        buildMutation({ mutate: mutateMock }) as unknown as ReturnType<
          typeof useDeleteAddress
        >,
      );

      const { result } = renderHook(() => useAddressDeletion());

      act(() => {
        result.current.handleLongPressAddress("addr-2", "addr-1");
      });
      act(() => {
        result.current.handleDeleteConfirm();
      });

      expect(result.current.deletingAddressId).toBeNull();
    });
  });

  describe("isDeleting", () => {
    it("should reflect the isPending value from useDeleteAddress", () => {
      mockUseDeleteAddress.mockReturnValue(
        buildMutation({ isPending: true }) as unknown as ReturnType<
          typeof useDeleteAddress
        >,
      );

      const { result } = renderHook(() => useAddressDeletion());

      expect(result.current.isDeleting).toBe(true);
    });
  });
});
