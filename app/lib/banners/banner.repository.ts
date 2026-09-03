import { prisma } from "@/app/lib/prisma";
import type { Banner } from "./banner.types";

export async function findAllBanners(): Promise<Banner[]> {
  return prisma.banner.findMany({
    orderBy: {
      id: "desc",
    },
  });
}

export async function createBanner(
  data: { url: string }
): Promise<Banner> {
  return prisma.banner.create({
    data,
  });
}

export async function deleteBanner(
  id: number
): Promise<Banner> {
  return prisma.banner.delete({
    where: {
      id,
    },
  });
}