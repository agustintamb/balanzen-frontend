import { useCallback, useMemo, useState } from "react";
import type { Address } from "@/api/addresses/addresses.types";

interface UseAddressSelectionResult {
  localSelectedId: string | null;
  setLocalSelectedId: (id: string | null) => void;
  savedSelectedId: string | null;
  sortedAddresses: Address[];
  handlePressAddress: (id: string) => void;
  canContinue: boolean;
}

export const useAddressSelection = (
  addresses: Address[],
): UseAddressSelectionResult => {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);

  const savedSelectedId = useMemo(
    () => addresses.find((a) => a.is_selected)?.id ?? null,
    [addresses],
  );

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => {
      if (a.is_selected === b.is_selected) return 0;
      return a.is_selected ? -1 : 1;
    });
  }, [addresses]);

  const handlePressAddress = useCallback((id: string) => {
    setLocalSelectedId(id);
  }, []);

  const canContinue = useMemo(
    () =>
      sortedAddresses.length > 0 &&
      !!localSelectedId &&
      localSelectedId !== savedSelectedId,
    [sortedAddresses.length, localSelectedId, savedSelectedId],
  );

  return {
    localSelectedId,
    setLocalSelectedId,
    savedSelectedId,
    sortedAddresses,
    handlePressAddress,
    canContinue,
  };
};
