import apiClient from "@/api/client";
import { uploadsService } from "@/api/uploads/uploads.service";
import { UploadImageResponse } from "@/api/uploads/uploads.types";

jest.mock("@/api/client", () => ({
  get: jest.fn(),
  put: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const buildUploadImageResponse = (
  overrides?: Partial<UploadImageResponse>
): UploadImageResponse => ({
  url: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
  ...overrides,
});

const buildFormData = (): FormData => {
  const formData = new FormData();
  formData.append("file", {
    uri: "file:///path/to/image.jpg",
    name: "image.jpg",
    type: "image/jpeg",
  } as unknown as Blob);
  return formData;
};

describe("uploadsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadImage", () => {
    it("should call POST /uploads/image with the provided FormData", async () => {
      const formData = buildFormData();
      const response = buildUploadImageResponse();
      mockedApiClient.post.mockResolvedValueOnce(response);

      const result = await uploadsService.uploadImage(formData);

      expect(mockedApiClient.post).toHaveBeenCalledTimes(1);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        "/uploads/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      expect(result).toEqual(response);
    });

    it("should set the Content-Type header to multipart/form-data", async () => {
      const formData = buildFormData();
      mockedApiClient.post.mockResolvedValueOnce(buildUploadImageResponse());

      await uploadsService.uploadImage(formData);

      const callArgs = mockedApiClient.post.mock.calls[0];
      expect(callArgs[2]).toEqual({
        headers: { "Content-Type": "multipart/form-data" },
      });
    });

    it("should return the UploadImageResponse with the uploaded image url", async () => {
      const formData = buildFormData();
      const response = buildUploadImageResponse({
        url: "https://res.cloudinary.com/demo/image/upload/v1/product.png",
      });
      mockedApiClient.post.mockResolvedValueOnce(response);

      const result = await uploadsService.uploadImage(formData);

      expect(result.url).toBe(
        "https://res.cloudinary.com/demo/image/upload/v1/product.png"
      );
    });

    it("should pass the FormData instance directly to apiClient without modification", async () => {
      const formData = buildFormData();
      mockedApiClient.post.mockResolvedValueOnce(buildUploadImageResponse());

      await uploadsService.uploadImage(formData);

      const passedFormData = mockedApiClient.post.mock.calls[0][1];
      expect(passedFormData).toBe(formData);
    });

    it("should reject when the API call fails with a server error", async () => {
      const formData = buildFormData();
      const error = new Error("Internal Server Error");
      mockedApiClient.post.mockRejectedValueOnce(error);

      await expect(uploadsService.uploadImage(formData)).rejects.toThrow(
        "Internal Server Error"
      );
    });

    it("should reject when the file size exceeds the limit", async () => {
      const formData = buildFormData();
      const error = new Error("File too large");
      mockedApiClient.post.mockRejectedValueOnce(error);

      await expect(uploadsService.uploadImage(formData)).rejects.toThrow(
        "File too large"
      );
    });

    it("should reject when an unsupported media type is uploaded", async () => {
      const formData = buildFormData();
      const error = new Error("Unsupported Media Type");
      mockedApiClient.post.mockRejectedValueOnce(error);

      await expect(uploadsService.uploadImage(formData)).rejects.toThrow(
        "Unsupported Media Type"
      );
    });
  });

  describe("deleteImage", () => {
    it("should call DELETE /uploads/image with the image url in the request body", async () => {
      const url = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg";
      const response = { message: "Image deleted successfully" };
      mockedApiClient.delete.mockResolvedValueOnce(response);

      const result = await uploadsService.deleteImage(url);

      expect(mockedApiClient.delete).toHaveBeenCalledTimes(1);
      expect(mockedApiClient.delete).toHaveBeenCalledWith("/uploads/image", {
        data: { url },
      });
      expect(result).toEqual(response);
    });

    it("should pass the url as data in the request config", async () => {
      const url = "https://res.cloudinary.com/demo/image/upload/v1/other.jpg";
      mockedApiClient.delete.mockResolvedValueOnce({ message: "Deleted" });

      await uploadsService.deleteImage(url);

      const callArgs = mockedApiClient.delete.mock.calls[0];
      expect(callArgs[1]).toEqual({ data: { url } });
    });

    it("should return the message from the server response", async () => {
      const url = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg";
      mockedApiClient.delete.mockResolvedValueOnce({
        message: "Image removed from storage",
      });

      const result = await uploadsService.deleteImage(url);

      expect(result.message).toBe("Image removed from storage");
    });

    it("should reject when the image url does not exist", async () => {
      const url = "https://res.cloudinary.com/demo/image/upload/v1/not-found.jpg";
      const error = new Error("Not Found");
      mockedApiClient.delete.mockRejectedValueOnce(error);

      await expect(uploadsService.deleteImage(url)).rejects.toThrow("Not Found");
    });

    it("should reject when unauthorized to delete the image", async () => {
      const url = "https://res.cloudinary.com/demo/image/upload/v1/protected.jpg";
      const error = new Error("Unauthorized");
      mockedApiClient.delete.mockRejectedValueOnce(error);

      await expect(uploadsService.deleteImage(url)).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("should handle different cloudinary url formats", async () => {
      const url =
        "https://res.cloudinary.com/balanzen/image/upload/w_500,h_500/v1234567890/publications/abc123.webp";
      mockedApiClient.delete.mockResolvedValueOnce({ message: "Deleted" });

      await uploadsService.deleteImage(url);

      expect(mockedApiClient.delete).toHaveBeenCalledWith("/uploads/image", {
        data: { url },
      });
    });
  });
});
