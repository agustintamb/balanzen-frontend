import { act, renderHook } from "@testing-library/react-native";
import type { Address } from "@/api/addresses/addresses.types";
import { useAddressSelection } from "@/components/AddressScreen/hooks/useAddressSelection";

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

describe("useAddressSelection", () => {
  describe("initial state", () => {
    it("should have localSelectedId as null on mount", () => {
      const { result } = renderHook(() => useAddressSelection([]));

      expect(result.current.localSelectedId).toBeNull();
    });
  });

  describe("savedSelectedId", () => {
    it("should return the id of the address with is_selected=true", () => {
      const addresses = [
        buildAddress({ id: "addr-1", is_selected: false }),
        buildAddress({ id: "addr-2", is_selected: true }),
      ];

      const { result } = renderHook(() => useAddressSelection(addresses));

      expect(result.current.savedSelectedId).toBe("addr-2");
    });

    it("should be null when no address has is_selected=true", () => {
      const addresses = [
        buildAddress({ id: "addr-1", is_selected: false }),
        buildAddress({ id: "addr-2", is_selected: false }),
      ];

      const { result } = renderHook(() => useAddressSelection(addresses));

      expect(result.current.savedSelectedId).toBeNull();
    });
  });

  describe("sortedAddresses", () => {
    it("should put the selected address first", () => {
      const addresses = [
        buildAddress({ id: "addr-unselected", is_selected: false }),
        buildAddress({ id: "addr-selected", is_selected: true }),
      ];

      const { result } = renderHook(() => useAddressSelection(addresses));

      expect(result.current.sortedAddresses[0].id).toBe("addr-selected");
    });

    it("should preserve original order when is_selected values are equal", () => {
      const addresses = [
        buildAddress({ id: "addr-a", is_selected: false }),
        buildAddress({ id: "addr-b", is_selected: false }),
      ];

      const { result } = renderHook(() => useAddressSelection(addresses));

      expect(result.current.sortedAddresses.map((a) => a.id)).toEqual([
        "addr-a",
        "addr-b",
      ]);
    });
  });

  describe("handlePressAddress", () => {
    it("should update localSelectedId to the pressed address id", () => {
      const addresses = [
        buildAddress({ id: "addr-1" }),
        buildAddress({ id: "addr-2" }),
      ];

      const { result } = renderHook(() => useAddressSelection(addresses));

      act(() => {
        result.current.handlePressAddress("addr-2");
      });

      expect(result.current.localSelectedId).toBe("addr-2");
    });
  });

  describe("canContinue", () => {
    it("should be false when localSelectedId is null", () => {
      const addresses = [buildAddress({ id: "addr-1", is_selected: false })];

      const { result } = renderHook(() => useAddressSelection(addresses));

      expect(result.current.canContinue).toBe(false);
    });

    it("should be false when localSelectedId equals savedSelectedId", () => {
      const addresses = [buildAddress({ id: "addr-1", is_selected: true })];

      const { result } = renderHook(() => useAddressSelection(addresses));

      act(() => {
        result.current.handlePressAddress("addr-1");
      });

      expect(result.current.canContinue).toBe(false);
    });

    it("should be true when localSelectedId is set and different from savedSelectedId", () => {
      const addresses = [
        buildAddress({ id: "addr-1", is_selected: true }),
        buildAddress({ id: "addr-2", is_selected: false }),
      ];

      const { result } = renderHook(() => useAddressSelection(addresses));

      act(() => {
        result.current.handlePressAddress("addr-2");
      });

      expect(result.current.canContinue).toBe(true);
    });

    it("should be false when the addresses list is empty even if localSelectedId is set", () => {
      const { result } = renderHook(() => useAddressSelection([]));

      act(() => {
        result.current.setLocalSelectedId("addr-phantom");
      });

      expect(result.current.canContinue).toBe(false);
    });
  });
});
