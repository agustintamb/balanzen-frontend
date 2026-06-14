import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { router } from "expo-router";
import type { AddressInput } from "@/api/addresses/addresses.types";
import {
  useAddresses,
  useAddressSearch,
  useCreateAddress,
  useSelectAddress,
} from "@/hooks/useAddresses";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "@/stores/ui.store";
import { buildAddressFromCoords } from "@/utils/address";
import type { Region } from "./AddressMap";
import { useAddressDeletion } from "./hooks/useAddressDeletion";
import { useAddressSelection } from "./hooks/useAddressSelection";
import { useLocationRequest } from "./hooks/useLocationRequest";

// list  → "Mis Direcciones" (listado)
// add   → "Ingresá tu dirección" (buscador + GPS)
// map   → confirmación de ubicación en el mapa
export type AddressMode = "list" | "add" | "map";

const DEFAULT_REGION: Region = {
  latitude: -34.6037,
  longitude: -58.3816,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export const useAddressScreen = () => {
  const [mode, setMode] = useState<AddressMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [pendingAddress, setPendingAddress] = useState<AddressInput | null>(
    null,
  );
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const { setHasAddress, setHasSelectedAddress, user } = useAuthStore();
  const { showSuccess } = useToast();
  const { data: addresses = [], isLoading: isLoadingAddresses } =
    useAddresses();
  const { mutate: createAddress, isPending: isSaving } = useCreateAddress();
  const { mutate: selectAddress, isPending: isSelecting } = useSelectAddress();

  const {
    isGettingLocation,
    permissionDenied,
    locationError,
    handleUseCurrentLocation,
  } = useLocationRequest();
  const {
    localSelectedId,
    setLocalSelectedId,
    sortedAddresses,
    handlePressAddress,
    canContinue,
  } = useAddressSelection(addresses);
  const {
    deletingAddressId,
    isDeleting,
    handleLongPressAddress,
    handleDeleteCancel,
    handleDeleteConfirm,
  } = useAddressDeletion();

  // ─── Inicialización ────────────────────────────────────────────────────────

  // Si no hay ninguna dirección guardada, ir directo al buscador
  useEffect(() => {
    if (!isLoadingAddresses && addresses.length === 0) {
      setMode("add");
    }
  }, [isLoadingAddresses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-seleccionar la dirección activa del backend al cargar.
  useEffect(() => {
    if (localSelectedId === null) {
      const active = addresses.find((a) => a.is_selected);
      if (active) {
        setLocalSelectedId(active.id);
      } else if (addresses.length === 1) {
        setLocalSelectedId(addresses[0].id);
      }
    }
  }, [addresses, localSelectedId, setLocalSelectedId]);

  // ─── Back handler ──────────────────────────────────────────────────────────

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (mode === "map") {
        setMode("add");
        setPendingAddress(null);
        return true;
      }
      if (mode === "add") {
        if (addresses.length > 0) {
          setMode("list");
          return true;
        }
        return true;
      }
      if (addresses.length === 0) return true;
      return false;
    });
    return () => sub.remove();
  }, [mode, addresses.length]);

  // ─── Search debounce ───────────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults = [], isFetching: isSearching } =
    useAddressSearch(debouncedQuery);

  // ─── Handlers — buscador / GPS ─────────────────────────────────────────────

  const handleUseCurrentLocationWrapper = useCallback(async () => {
    await handleUseCurrentLocation((address, newRegion) => {
      setPendingAddress(address);
      setRegion(newRegion);
      setMode("map");
    });
  }, [handleUseCurrentLocation]);

  const handleSelectSearchResult = useCallback((result: AddressInput) => {
    setPendingAddress(result);
    setRegion({
      latitude: result.lat,
      longitude: result.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setSearchQuery("");
    setMode("map");
  }, []);

  // ─── Handlers — mapa ──────────────────────────────────────────────────────

  const handleRegionChangeComplete = useCallback(async (newRegion: Region) => {
    setRegion(newRegion);
    setIsReverseGeocoding(true);
    try {
      const address = await buildAddressFromCoords(
        newRegion.latitude,
        newRegion.longitude,
      );
      setPendingAddress(address);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const handleConfirmAddress = useCallback(() => {
    if (!pendingAddress) return;
    createAddress(pendingAddress, {
      onSuccess: (newAddress) => {
        setPendingAddress(null);
        setLocalSelectedId(newAddress.id);
        setMode("list");
      },
    });
  }, [pendingAddress, createAddress, setLocalSelectedId]);

  // ─── Handlers — volver ────────────────────────────────────────────────────

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(
        user?.role === "COMERCIO" ? "/(commerce)/home" : "/(consumer)/home",
      );
    }
  };

  // ─── Handlers — continuar ─────────────────────────────────────────────────

  const handleContinue = useCallback(() => {
    if (!localSelectedId) return;
    selectAddress(localSelectedId, {
      onSuccess: () => {
        setHasAddress(true);
        setHasSelectedAddress(true);
        if (router.canGoBack()) {
          showSuccess("Dirección guardada");
          router.back();
        } else {
          router.replace(
            user?.role === "COMERCIO" ? "/(commerce)/home" : "/(consumer)/home",
          );
        }
      },
    });
  }, [
    localSelectedId,
    selectAddress,
    setHasAddress,
    setHasSelectedAddress,
    showSuccess,
    user?.role,
  ]);

  const handleLongPressAddressWrapper = useCallback(
    (id: string) => handleLongPressAddress(id, localSelectedId),
    [handleLongPressAddress, localSelectedId],
  );

  return {
    mode,
    setMode,
    canGoBack: router.canGoBack(),
    handleBack,
    // Buscador
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isGettingLocation,
    permissionDenied,
    locationError,
    // Lista
    addresses: sortedAddresses,
    isLoadingAddresses,
    localSelectedId,
    canContinue,
    // Eliminación
    deletingAddressId,
    isDeleting,
    handlePressAddress,
    handleLongPressAddress: handleLongPressAddressWrapper,
    handleDeleteCancel,
    handleDeleteConfirm,
    // Mapa
    pendingAddress,
    region,
    isReverseGeocoding,
    isSaving,
    // Handlers
    handleUseCurrentLocation: handleUseCurrentLocationWrapper,
    handleSelectSearchResult,
    handleRegionChangeComplete,
    handleConfirmAddress,
    handleContinue,
    isSelecting,
  };
};
