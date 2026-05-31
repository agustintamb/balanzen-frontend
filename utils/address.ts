import * as Location from "expo-location";
import type { AddressInput } from "@/api/addresses/addresses.types";

export const buildAddressFromCoords = async (
  lat: number,
  lng: number,
): Promise<AddressInput> => {
  const results = await Location.reverseGeocodeAsync({
    latitude: lat,
    longitude: lng,
  });
  const place = results[0];

  const streetLine =
    place?.streetNumber && place?.street
      ? `${place.street} ${place.streetNumber}`
      : (place?.street ?? "");

  const formatted =
    place?.formattedAddress ??
    [streetLine, place?.city ?? place?.subregion ?? "", place?.region ?? ""]
      .filter(Boolean)
      .join(", ");

  return {
    formatted_address: formatted,
    street: place?.street ?? "",
    number: place?.streetNumber ?? "",
    city: place?.city ?? place?.subregion ?? "",
    province: place?.region ?? "",
    lat,
    lng,
  };
};
