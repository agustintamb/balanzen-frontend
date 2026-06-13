import {
  buildAvatarUrl,
  buildCardImageUrl,
  buildDetailImageUrl,
  buildProfilePhotoUrl,
} from "@/utils/cloudinary";

const CLOUDINARY_URL =
  "https://res.cloudinary.com/demo/image/upload/sample.jpg";
const EXTERNAL_URL = "https://example.com/photo.jpg";

describe("buildProfilePhotoUrl", () => {
  it("inserts w_200,h_200,c_fill transform for Cloudinary URLs", () => {
    expect(buildProfilePhotoUrl(CLOUDINARY_URL)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_200,h_200,c_fill,q_auto,f_auto/sample.jpg",
    );
  });

  it("returns URL unchanged when /upload/ is absent", () => {
    expect(buildProfilePhotoUrl(EXTERNAL_URL)).toBe(EXTERNAL_URL);
  });
});

describe("buildCardImageUrl", () => {
  it("inserts w_400,h_400,c_fill transform for Cloudinary URLs", () => {
    expect(buildCardImageUrl(CLOUDINARY_URL)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill,q_auto,f_auto/sample.jpg",
    );
  });

  it("returns URL unchanged when /upload/ is absent", () => {
    expect(buildCardImageUrl(EXTERNAL_URL)).toBe(EXTERNAL_URL);
  });
});

describe("buildDetailImageUrl", () => {
  it("inserts w_800 transform for Cloudinary URLs", () => {
    expect(buildDetailImageUrl(CLOUDINARY_URL)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_800,q_auto,f_auto/sample.jpg",
    );
  });

  it("returns URL unchanged when /upload/ is absent", () => {
    expect(buildDetailImageUrl(EXTERNAL_URL)).toBe(EXTERNAL_URL);
  });
});

describe("buildAvatarUrl", () => {
  it("inserts w_100,h_100,c_fill transform for Cloudinary URLs", () => {
    expect(buildAvatarUrl(CLOUDINARY_URL)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_100,h_100,c_fill,q_auto,f_auto/sample.jpg",
    );
  });

  it("returns URL unchanged when /upload/ is absent", () => {
    expect(buildAvatarUrl(EXTERNAL_URL)).toBe(EXTERNAL_URL);
  });
});
