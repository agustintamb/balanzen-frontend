import type { PublishFormValues } from "./types";

/** Máximo de imágenes permitidas por publicación. */
export const MAX_PHOTOS = 4;

export const DEFAULT_VALUES: PublishFormValues = {
  title: "",
  description: "",
  expiry_date: null,
  category_id: "",
  is_donation: false,
  final_price: "",
  original_price: "",
};
