import { useState } from "react";
import * as Location from "expo-location";
import type { AddressInput } from "@/api/addresses/addresses.types";
import { buildAddressFromCoords } from "@/utils/address";
import type { Region } from "../AddressMap";

const LOCATION_TIMEOUT_MS = 7000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let id: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((_, reject) => {
    id = setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(id));
};

interface UseLocationRequestResult {
  isGettingLocation: boolean;
  permissionDenied: boolean;
  locationError: string | null;
  handleUseCurrentLocation: (
    onSuccess: (address: AddressInput, region: Region) => void,
  ) => Promise<void>;
}

export const useLocationRequest = (): UseLocationRequestResult => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleUseCurrentLocation = async (
    onSuccess: (address: AddressInput, region: Region) => void,
  ) => {
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
      onSuccess(address, {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch {
      setLocationError(
        "No pudimos obtener tu ubicación. Intentá buscar manualmente.",
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  return {
    isGettingLocation,
    permissionDenied,
    locationError,
    handleUseCurrentLocation,
  };
};
