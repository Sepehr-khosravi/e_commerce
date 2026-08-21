import ImageKit from "imagekit";

import type {
  StorageProvider,
  UploadImageInput,
  UploadedImage,
} from "./storage.types";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export class ImageKitStorage
  implements StorageProvider
{
  async uploadImage(
    input: UploadImageInput
  ): Promise<UploadedImage> {
    const result = await imagekit.upload({
      file: input.file,
      fileName: input.fileName,

      ...(input.folder
        ? {
            folder: input.folder,
          }
        : {}),
    });

    return {
      url: result.url,
      publicId: result.fileId,
      width: result.width,
      height: result.height,
      format: result.fileType,
    };
  }

  async deleteImage(
    publicId: string
  ): Promise<void> {
    await imagekit.deleteFile(publicId);
  }
}