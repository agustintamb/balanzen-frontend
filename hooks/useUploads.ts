import { useMutation } from "@tanstack/react-query";

import { uploadsService } from "@/api/uploads/uploads.service";
import { UploadImageResponse } from "@/api/uploads/uploads.types";

export const useUploadImage = () =>
  useMutation<UploadImageResponse, Error, FormData>({
    mutationFn: uploadsService.uploadImage,
  });

export const useDeleteImage = () =>
  useMutation<{ message: string }, Error, string>({
    mutationFn: uploadsService.deleteImage,
  });
