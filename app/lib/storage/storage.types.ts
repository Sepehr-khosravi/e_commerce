export interface UploadImageInput {
  file: Buffer;
  fileName: string;
  folder?: string;
  mimeType?: string;
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface StorageProvider {
  uploadImage(
    input: UploadImageInput
  ): Promise<UploadedImage>;

  deleteImage(
    publicId: string
  ): Promise<void>;
}