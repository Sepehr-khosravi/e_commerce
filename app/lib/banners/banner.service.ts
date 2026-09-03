import {
  createBanner,
  deleteBanner,
  findAllBanners,
} from "@/app/lib/banners/banner.repository";

import type { Banner } from "./banner.types";
import { isValidImageFilename } from "./banner-url.validate";

export async function findBanners(): Promise<Banner[]> {
  return await findAllBanners();
}

export async function createNewBanner(
  data: { url: string }
): Promise<Banner> {
  if (
    !data ||
    typeof data.url !== "string" ||
    !data.url.trim() ||
    !isValidImageFilename(data.url)
  ) {
    throw new Error("Invalid url!");
  }

  return await createBanner({
    url: data.url.trim(),
  });
}

export async function removeBanner(
  id: number
): Promise<void> {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error("Invalid id");
  }

  await deleteBanner(id);
}