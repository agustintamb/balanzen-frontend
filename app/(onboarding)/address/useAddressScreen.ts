import { useEffect, useState } from "react";
import { BackHandler } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import type { AddressInput } from "@/api/addresses/addresses.types";
import {
  useAddresses,
  useAddressSearch,
  useCreateAddress,
  useDeleteAddress,
  useSelectAddress,
} from "@/hooks/useAddresses";
import { useAuthStore } from "@/stores/auth.store";
import { buildAddressFromCoords } from "./address.utils";
import type { Region } from "./components/AddressMap";

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

const LOCATION_TIMEOUT_MS = 7000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let id: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    id = setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(id));
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

  // GPS — se solicita solo al presionar el botón, no al entrar a la pantalla
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Selección local (se persiste al presionar Continuar)
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);

  // Eliminación: id del address a eliminar (null = sheet cerrado)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(
    null,
  );

  const { setHasAddress, user } = useAuthStore();
  const { data: addresses = [], isLoading: isLoadingAddresses } =
    useAddresses();
  const { mutate: createAddress, isPending: isSaving } = useCreateAddress();
  const { mutate: selectAddress, isPending: isSelecting } = useSelectAddress();
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();

  // ─── Inicialización ────────────────────────────────────────────────────────

  // Si no hay ninguna dirección guardada, ir directo al buscador
  useEffect(() => {
    if (!isLoadingAddresses && addresses.length === 0) {
      setMode("add");
    }
  }, [isLoadingAddresses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-seleccionar la dirección activa del backend al cargar
  useEffect(() => {
    if (localSelectedId === null) {
      const active = addresses.find((a) => a.is_selected);
      if (active) setLocalSelectedId(active.id);
    }
  }, [addresses, localSelectedId]);

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
        return true; // onboarding sin direcciones: bloquear salida
      }
      // list: bloquear si no hay ninguna guardada
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

  // La ubicación se solicita solo al presionar el botón — sin pre-fetch al montar.
  const handleUseCurrentLocation = async () => {
    if (isGettingLocation) return;
    setIsGettingLocation(true);
    setLocationError(null);
    try {
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        if (!canAskAgain) {
          setLocationError(
            "El permiso de ubicación fue denegado. Habilitalo en Configuración → Privacidad → Ubicación.",
          );
        }
        return;
      }
      setPermissionDenied(false);

      let location = await Location.getLastKnownPositionAsync({
        maxAge: 300_000,
        requiredAccuracy: 1000,
      });
      if (!location) {
        location = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
          LOCATION_TIMEOUT_MS,
        );
      }
      const { latitude, longitude } = location.coords;
      const address = await buildAddressFromCoords(latitude, longitude);
      setPendingAddress(address);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setMode("map");
    } catch {
      setLocationError(
        "No pudimos obtener tu ubicación. Intentá buscar manualmente.",
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSelectSearchResult = (result: AddressInput) => {
    setPendingAddress(result);
    setRegion({
      latitude: result.lat,
      longitude: result.lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setSearchQuery("");
    setMode("map");
  };

  // ─── Handlers — mapa ──────────────────────────────────────────────────────

  const handleRegionChangeComplete = async (newRegion: Region) => {
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
  };

  const handleConfirmAddress = () => {
    if (!pendingAddress) return;
    createAddress(pendingAddress, {
      onSuccess: () => {
        setPendingAddress(null);
        setMode("list");
      },
    });
  };

  // ─── Handlers — lista ─────────────────────────────────────────────────────

  // Presionar → selecciona la dirección
  const handlePressAddress = (id: string) => {
    setLocalSelectedId(id);
  };

  // Long press → abre confirmación de eliminación (solo si no está seleccionada)
  const handleLongPressAddress = (id: string) => {
    if (id === localSelectedId) return;
    setDeletingAddressId(id);
  };

  const handleDeleteCancel = () => setDeletingAddressId(null);

  const handleDeleteConfirm = () => {
    if (!deletingAddressId) return;
    deleteAddress(deletingAddressId, {
      onSuccess: () => setDeletingAddressId(null),
    });
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const savedSelectedId = addresses.find((a) => a.is_selected)?.id ?? null;

  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.is_selected === b.is_selected) return 0;
    return a.is_selected ? -1 : 1;
  });

  // ─── Handlers — continuar ─────────────────────────────────────────────────

  const handleContinue = () => {
    if (!localSelectedId) return;
    selectAddress(localSelectedId, {
      onSuccess: () => {
        setHasAddress(true);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(
            (user?.role === "COMERCIO"
              ? "/(commerce)/home"
              : "/(consumer)/home") as never,
          );
        }
      },
    });
  };

  return {
    mode,
    setMode,
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
    canContinue: !!localSelectedId && localSelectedId !== savedSelectedId,
    // Eliminación
    deletingAddressId,
    isDeleting,
    handlePressAddress,
    handleLongPressAddress,
    handleDeleteCancel,
    handleDeleteConfirm,
    // Mapa
    pendingAddress,
    region,
    isReverseGeocoding,
    isSaving,
    // Handlers
    handleUseCurrentLocation,
    handleSelectSearchResult,
    handleRegionChangeComplete,
    handleConfirmAddress,
    handleContinue,
    isSelecting,
  };
};

// Expo Router requires a default export in app/ — this file is a hook, not a screen
export default function _() {
  return null;
}
