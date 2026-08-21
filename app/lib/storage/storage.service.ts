import { ImageKitStorage } from "./imagekit";

import type {
  UploadImageInput,
  UploadedImage,
} from "./storage.types";

const storage = new ImageKitStorage();

export async function uploadImage(
  input: UploadImageInput
): Promise<UploadedImage> {
  return storage.uploadImage(input);
}

export async function deleteImage(
  publicId: string
): Promise<void> {
  return storage.deleteImage(publicId);
}