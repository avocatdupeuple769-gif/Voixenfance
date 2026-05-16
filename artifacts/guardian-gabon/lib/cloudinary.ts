// Cloudinary — free media storage (photos + videos)
// https://cloudinary.com/users/register_free

export const CLOUDINARY_CLOUD_NAME = "dwwky8tnr";

// Unsigned upload preset — create in:
// Cloudinary dashboard → Settings → Upload → Upload presets → Add → Unsigned
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_PRESET ?? "afhxvsxc";

/**
 * Returns the upload URL for Cloudinary.
 * Uses resource_type "auto" so it handles both images and videos.
 */
export function cloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
}
