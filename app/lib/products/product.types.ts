import type { Prisma } from "@/generated/prisma/client";

export type ProductSort =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "popular";

export interface SearchProductsOptions {
  query?: string;
  categoryId?: number;

  minPrice?: number;
  maxPrice?: number;

  sort?: ProductSort;

  cursor?: number;
  limit?: number;
}

export interface ProductPagination {
  products: Prisma.ProductGetPayload<{
    include: {
      category: true;
    };
  }>[];

  nextCursor: number | null;
  hasNextPage: boolean;
}

export interface CreateProductData {
  title: string;
  slug: string;

  price: number;
  offer?: number | null;

  images: string[];

  description: string;

  categoryId: number;

  count?: number;

  isFeatured?: boolean;
  isActive?: boolean;
}

export interface UpdateProductData {
  title?: string;
  slug?: string;

  price?: number;
  offer?: number | null;

  images?: string[];

  description?: string;

  categoryId?: number;

  count?: number;

  isFeatured?: boolean;
  isActive?: boolean;
}