import apiClient from "@/api/client";
import { UploadImageResponse } from "@/api/uploads/uploads.types";

export const uploadsService = {
  uploadImage: (formData: FormData): Promise<UploadImageResponse> =>
    apiClient.post("/uploads/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteImage: (url: string): Promise<{ message: string }> =>
    apiClient.delete("/uploads/image", { data: { url } }),
};
