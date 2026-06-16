import type { Category } from "@/api/categories/categories.types";
import type {
  CreatePublicationBody,
  Publication,
} from "@/api/publications/publications.types";
import type { PhotoItem, PublishFormValues } from "./types";

/** Convierte un string de precio a número, o NaN si no es válido. */
export const parsePrice = (value: string): number => {
  if (!value.trim()) return Number.NaN;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

/** El paso 1 está completo cuando hay título, descripción, categoría y fecha. */
export const isStep1Complete = (values: PublishFormValues): boolean =>
  values.title.trim().length > 0 &&
  values.description.trim().length > 0 &&
  values.category_id.length > 0 &&
  values.expiry_date !== null;

/** El paso 2 está completo si es donación, o si los precios son válidos
 *  (ambos > 0 y el de venta no supera al original). */
export const isStep2Complete = (values: PublishFormValues): boolean => {
  if (values.is_donation) return true;
  const final = parsePrice(values.final_price);
  const original = parsePrice(values.original_price);
  return final > 0 && original > 0 && final <= original;
};

/** Ordena las categorías dejando "Otro(s)" siempre al final. */
export const sortCategories = (categories: Category[]): Category[] => {
  const isOther = (name: string) => /^otros?$/i.test(name.trim());
  return [...categories].sort((a, b) => {
    if (isOther(a.name)) return 1;
    if (isOther(b.name)) return -1;
    return 0;
  });
};

/** Arma el body para POST/PUT /publications. En donación, ambos precios van en 0
 *  (el backend deriva is_donation a partir de original_price === final_price). */
export const buildPublicationBody = (
  values: PublishFormValues,
  photoUrls: string[],
): CreatePublicationBody => ({
  title: values.title.trim(),
  description: values.description.trim(),
  original_price: values.is_donation ? 0 : parsePrice(values.original_price),
  final_price: values.is_donation ? 0 : parsePrice(values.final_price),
  expiry_date: (values.expiry_date as Date).toISOString(),
  category_id: values.category_id,
  photos: photoUrls,
});

/** Mapea una publicación existente a valores del formulario (modo edición). */
export const publicationToFormValues = (
  publication: Publication,
): PublishFormValues => ({
  title: publication.title,
  description: publication.description,
  expiry_date: new Date(publication.expiry_date),
  category_id: publication.category.id,
  is_donation: publication.is_donation,
  final_price: publication.is_donation ? "" : String(publication.final_price),
  original_price: publication.is_donation
    ? ""
    : String(publication.original_price),
});

/** Mapea las URLs de fotos existentes a PhotoItem ya subidas (modo edición). */
export const publicationPhotosToItems = (photos: string[]): PhotoItem[] =>
  photos.map((url, index) => ({
    id: `existing-${index}`,
    uri: url,
    url,
    status: "done",
  }));
