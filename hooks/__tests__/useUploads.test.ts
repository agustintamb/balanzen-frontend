import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native/pure";
import React from "react";

import { uploadsService } from "@/api/uploads/uploads.service";
import { UploadImageResponse } from "@/api/uploads/uploads.types";
import { useDeleteImage, useUploadImage } from "@/hooks/useUploads";

jest.mock("@/api/uploads/uploads.service", () => ({
  uploadsService: {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  },
}));

const mockUploadsService = uploadsService as jest.Mocked<typeof uploadsService>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return wrapper;
};

describe("useUploadImage", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should initialize with idle status", () => {
    const { result } = renderHook(() => useUploadImage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should return upload URL when mutation succeeds", async () => {
    const mockResponse: UploadImageResponse = {
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    };
    mockUploadsService.uploadImage.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUploadImage(), {
      wrapper: createWrapper(),
    });

    const formData = new FormData();
    formData.append("file", "base64data");

    result.current.mutate(formData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.url).toBe(
      "https://res.cloudinary.com/demo/image/upload/sample.jpg"
    );
  });

  it("should call uploadsService.uploadImage with the provided FormData", async () => {
    const mockResponse: UploadImageResponse = { url: "https://example.com/img.jpg" };
    mockUploadsService.uploadImage.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUploadImage(), {
      wrapper: createWrapper(),
    });

    const formData = new FormData();
    formData.append("image", "somedata");

    result.current.mutate(formData);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUploadsService.uploadImage).toHaveBeenCalledTimes(1);
    expect(mockUploadsService.uploadImage).toHaveBeenCalledWith(
      formData,
      expect.objectContaining({ client: expect.anything() })
    );
  });

  it("should set isError when upload fails with a network error", async () => {
    const networkError = new Error("Network Error");
    mockUploadsService.uploadImage.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useUploadImage(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(new FormData());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Network Error");
    expect(result.current.data).toBeUndefined();
  });

  it("should set isError when upload fails with a 413 payload too large error", async () => {
    const payloadError = Object.assign(new Error("Payload Too Large"), {
      response: { status: 413 },
    });
    mockUploadsService.uploadImage.mockRejectedValueOnce(payloadError);

    const { result } = renderHook(() => useUploadImage(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(new FormData());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Payload Too Large");
  });

  it("should support mutateAsync and return the resolved value", async () => {
    const mockResponse: UploadImageResponse = { url: "https://cdn.example.com/photo.png" };
    mockUploadsService.uploadImage.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUploadImage(), {
      wrapper: createWrapper(),
    });

    let resolvedValue: UploadImageResponse | undefined;

    await waitFor(async () => {
      resolvedValue = await result.current.mutateAsync(new FormData());
    });

    expect(resolvedValue).toEqual(mockResponse);
  });

  it("should allow multiple sequential mutations", async () => {
    const firstResponse: UploadImageResponse = { url: "https://cdn.example.com/first.jpg" };
    const secondResponse: UploadImageResponse = { url: "https://cdn.example.com/second.jpg" };

    mockUploadsService.uploadImage
      .mockResolvedValueOnce(firstResponse)
      .mockResolvedValueOnce(secondResponse);

    const { result } = renderHook(() => useUploadImage(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(new FormData());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(firstResponse);

    result.current.mutate(new FormData());

    await waitFor(() => expect(result.current.data).toEqual(secondResponse));
    expect(mockUploadsService.uploadImage).toHaveBeenCalledTimes(2);
  });
});

describe("useDeleteImage", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should initialize with idle status", () => {
    const { result } = renderHook(() => useDeleteImage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it("should return success message when delete succeeds", async () => {
    const mockResponse = { message: "Image deleted successfully" };
    mockUploadsService.deleteImage.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useDeleteImage(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("https://cdn.example.com/to-delete.jpg");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.data?.message).toBe("Image deleted successfully");
  });

  it("should call uploadsService.deleteImage with the provided URL", async () => {
    mockUploadsService.deleteImage.mockResolvedValueOnce({ message: "Deleted" });

    const { result } = renderHook(() => useDeleteImage(), {
      wrapper: createWrapper(),
    });

    const imageUrl = "https://res.cloudinary.com/demo/image/upload/v123/photo.jpg";
    result.current.mutate(imageUrl);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUploadsService.deleteImage).toHaveBeenCalledTimes(1);
    expect(mockUploadsService.deleteImage).toHaveBeenCalledWith(
      imageUrl,
      expect.objectContaining({ client: expect.anything() })
    );
  });

  it("should set isError when delete fails with a 404 not found error", async () => {
    const notFoundError = Object.assign(new Error("Not Found"), {
      response: { status: 404 },
    });
    mockUploadsService.deleteImage.mockRejectedValueOnce(notFoundError);

    const { result } = renderHook(() => useDeleteImage(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("https://cdn.example.com/nonexistent.jpg");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Not Found");
  });

  it("should set isError when delete fails with a network error", async () => {
    mockUploadsService.deleteImage.mockRejectedValueOnce(new Error("Connection refused"));

    const { result } = renderHook(() => useDeleteImage(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("https://cdn.example.com/photo.jpg");

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Connection refused");
    expect(result.current.data).toBeUndefined();
  });

  it("should support mutateAsync and resolve with the message", async () => {
    mockUploadsService.deleteImage.mockResolvedValueOnce({ message: "Removed" });

    const { result } = renderHook(() => useDeleteImage(), {
      wrapper: createWrapper(),
    });

    let response: { message: string } | undefined;

    await waitFor(async () => {
      response = await result.current.mutateAsync("https://cdn.example.com/img.jpg");
    });

    expect(response).toEqual({ message: "Removed" });
  });

  it("should handle deletion of an empty string URL without crashing", async () => {
    mockUploadsService.deleteImage.mockResolvedValueOnce({ message: "Deleted" });

    const { result } = renderHook(() => useDeleteImage(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("");

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockUploadsService.deleteImage).toHaveBeenCalledWith(
      "",
      expect.objectContaining({ client: expect.anything() })
    );
  });
});
