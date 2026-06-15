import type {
  Publication,
  PublicationCommerce,
} from "@/api/publications/publications.types";
import {
  formatPrice,
  getExpiryWarning,
  STATUS_CHIP_VARIANT,
  STATUS_LABEL,
} from "@/components/ProductCard/utils";

// Reexportamos los helpers compartidos con las cards para no duplicarlos.
export { formatPrice, getExpiryWarning, STATUS_CHIP_VARIANT, STATUS_LABEL };

/** Fila de la card de datos del detalle (comercio o consumidor). */
export interface InfoItem {
  label: string;
  value: string;
  /** Apila el valor debajo del label a ancho completo (ej. dirección). */
  block?: boolean;
}

/** Ahorro absoluto (nunca negativo) de una publicación con descuento. */
export const getSavings = (publication: Publication): number =>
  Math.max(publication.original_price - publication.final_price, 0);

/** Arma el nombre del consumidor a partir de los campos snake_case del backend. */
export const buildFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`.trim();

/** Iniciales (hasta 2) para el fallback del avatar. */
export const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/** Datos del comercio para la card del detalle (vista del consumidor). */
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
