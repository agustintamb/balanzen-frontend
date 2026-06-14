import { useCallback, useState } from "react";
import { useDeleteAddress } from "@/hooks/useAddresses";

interface UseAddressDeletionResult {
  deletingAddressId: string | null;
  isDeleting: boolean;
  handleLongPressAddress: (id: string, selectedId: string | null) => void;
  handleDeleteCancel: () => void;
  handleDeleteConfirm: () => void;
}

export const useAddressDeletion = (): UseAddressDeletionResult => {
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

  const handleLongPressAddress = useCallback(
    (id: string, selectedId: string | null) => {
      if (id === selectedId) return;
      setDeletingAddressId(id);
    },
    [],
  );

  const handleDeleteCancel = useCallback(() => {
    setDeletingAddressId(null);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingAddressId) return;
    deleteAddress(deletingAddressId, {
      onSuccess: () => setDeletingAddressId(null),
    });
  }, [deletingAddressId, deleteAddress]);

  return {
    deletingAddressId,
    isDeleting,
    handleLongPressAddress,
    handleDeleteCancel,
    handleDeleteConfirm,
  };
};
