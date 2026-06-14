export type PublishMode = "create" | "edit";

export type PhotoSource = "camera" | "library";

export type PhotoStatus = "uploading" | "done";

export interface PhotoItem {
  id: string;
  uri: string;
  url: string | null;
  status: PhotoStatus;
}

/** Valores del formulario de publicación. Los precios se manejan como string
 *  (input de texto) y se convierten a número al enviar. */
export interface PublishFormValues {
  title: string;
  description: string;
  expiry_date: Date | null;
  category_id: string;
  is_donation: boolean;
  final_price: string;
  original_price: string;
}
