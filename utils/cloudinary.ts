export const buildProfilePhotoUrl = (url: string): string => {
  const transform = "w_200,h_200,c_fill,q_auto,f_auto";
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
};

export const buildCardImageUrl = (url: string): string => {
  const transform = "w_400,h_400,c_fill,q_auto,f_auto";
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
};

export const buildDetailImageUrl = (url: string): string => {
  const transform = "w_800,q_auto,f_auto";
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
};

export const buildAvatarUrl = (url: string): string => {
  const transform = "w_100,h_100,c_fill,q_auto,f_auto";
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/${transform}/`)
    : url;
};
