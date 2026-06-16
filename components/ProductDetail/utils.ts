import { Share } from "react-native";
import type {
  Publication,
  PublicationCommerce,
} from "@/api/publications/publications.types";
import { formatPrice } from "@/components/ProductCard/utils";

export { getExpiryWarning, STATUS_CHIP_VARIANT, STATUS_LABEL } from "@/components/ProductCard/utils";
export { formatPrice };

export interface InfoItem {
  label: string;
  value: string;
  block?: boolean;
}

export const getSavings = (publication: Publication): number =>
  Math.max(publication.original_price - publication.final_price, 0);

export const buildFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`.trim();

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

export const buildCommerceInfoItems = (
  commerce: PublicationCommerce,
): InfoItem[] => {
  const items: InfoItem[] = [
    { label: "Comercio", value: commerce.business_name },
  ];
  const owner = buildFullName(
    commerce.first_name ?? "",
    commerce.last_name ?? "",
  );
  if (owner) items.push({ label: "Dueño", value: owner });
  if (commerce.phone) items.push({ label: "Teléfono", value: commerce.phone });
  const address = commerce.selected_address?.formatted_address;
  if (address) items.push({ label: "Dirección", value: address, block: true });
  return items;
};

export const sharePublication = async (
  publication: Publication,
): Promise<void> => {
  try {
    await Share.share({
      message: `${publication.title} — ${formatPrice(publication.final_price)} en ${publication.commerce.business_name}`,
    });
  } catch {
    return;
  }
};
